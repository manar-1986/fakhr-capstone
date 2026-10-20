import mongoose from 'mongoose';

export function databaseOptions(production: boolean) {
 return {serverSelectionTimeoutMS: 10000, ...(production ? {autoIndex: false, autoCreate: false} : {})};
}

/** Run before application models are imported. Also protect model.init() calls. */
export function applyDatabasePolicy(production: boolean): void {
 if (production) {
  mongoose.set('autoIndex', false);
  mongoose.set('autoCreate', false);
 }
}
