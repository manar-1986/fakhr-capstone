import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.model';
import usersRouter from '../modules/users/users.routes';
import { errorHandler } from '../middlewares/error.middleware';
import { generateToken } from '../utils/jwt';
const app = express(); app.use(express.json()); app.use('/api/users', usersRouter); app.use(errorHandler);
async function account(role = 'parent') {
 const user = await User.create({ name: 'Synthetic User', email: `${new mongoose.Types.ObjectId()}@example.invalid`, password: 'synthetic-hash', role });
 return { id: user.id, token: generateToken({ userId: user.id, role: 'admin' }) };
}
describe('User authorization boundaries', () => {
 it('rejects guests', async () => { await request(app).get('/api/users').expect(401); });
 it.each(['parent', 'professional'])('denies %s despite an admin token claim', async role => {
  const u = await account(role); const r = await request(app).get('/api/users').auth(u.token, { type: 'bearer' }).expect(403);
  expect(r.body.data).toBeUndefined();
 });
 it('permits only database-authorized administrators and returns an explicit safe projection', async () => {
  const u = await account('admin'); await account();
  const r = await request(app).get('/api/users').auth(u.token, { type: 'bearer' }).expect(200);
  expect(r.body.data.count).toBe(2);
  for (const row of r.body.data.users) expect(Object.keys(row).sort()).toEqual(['id','name','email','role','createdAt','updatedAt'].sort());
 });
 it('denies a revoked administrator with an existing token', async () => {
  const u = await account('admin'); await User.updateOne({ _id: u.id }, { role: 'parent' });
  await request(app).get('/api/users').auth(u.token, { type: 'bearer' }).expect(403);
 });
 it.each(['unknown', ''])('denies unrecognized database role %s', async role => {
  const u = await account(); await User.collection.updateOne({ _id: new mongoose.Types.ObjectId(u.id) }, { $set: { role } });
  await request(app).get('/api/users').auth(u.token, { type: 'bearer' }).expect(403);
 });
 it('allows own valid ID read and update without role escalation', async () => {
  const u = await account();
  await request(app).get(`/api/users/${u.id.toUpperCase()}`).auth(u.token, { type: 'bearer' }).expect(200);
  await request(app).put(`/api/users/${u.id}`).auth(u.token, { type: 'bearer' }).send({ name: 'Updated synthetic', role: 'admin' }).expect(200);
  expect((await User.findById(u.id))?.role).toBe('parent');
 });
 it.each(['get','put','delete'] as const)('rejects malformed IDs for %s', async method => {
  const u = await account(); await request(app)[method]('/api/users/userId').auth(u.token, { type: 'bearer' }).send({ name: 'Synthetic' }).expect(400);
 });
 it.each(['get','put','delete'] as const)('rejects cross-user %s without modifying records', async method => {
  const u = await account(); const other = await account();
  await request(app)[method](`/api/users/${other.id}`).auth(u.token, { type: 'bearer' }).send({ name: 'Forbidden' }).expect(403);
  expect((await User.findById(other.id))?.name).toBe('Synthetic User');
 });
 it('does not disclose whether another user ID exists', async () => {
  const u = await account(); await request(app).get(`/api/users/${new mongoose.Types.ObjectId()}`).auth(u.token, { type: 'bearer' }).expect(403);
 });
 it('blocks own-account deletion pending retention approval', async () => {
  const u = await account(); await request(app).delete(`/api/users/${u.id}`).auth(u.token, { type: 'bearer' }).expect(503);
  expect(await User.findById(u.id)).not.toBeNull();
 });
});
