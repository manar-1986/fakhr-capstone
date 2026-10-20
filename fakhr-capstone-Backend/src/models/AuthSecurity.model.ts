import mongoose, { Schema } from 'mongoose';
const revokedSchema = new Schema({ _id: String, expiresAt: {type: Date, required: true} }, {versionKey:false});
revokedSchema.index({expiresAt:1},{expireAfterSeconds:0});
export const RevokedToken = mongoose.model('RevokedToken', revokedSchema);
const limitSchema = new Schema({ _id: String, count: Number, expiresAt: Date }, {versionKey:false});
limitSchema.index({expiresAt:1},{expireAfterSeconds:0});
export const AuthLimit = mongoose.model('AuthLimit', limitSchema);
