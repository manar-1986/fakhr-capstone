import mongoose from 'mongoose';
const schema=new mongoose.Schema({parentId:{type:mongoose.Schema.Types.ObjectId,required:true},childId:{type:mongoose.Schema.Types.ObjectId,required:true},enabled:{type:Boolean,required:true},quietStart:{type:String,required:true},quietEnd:{type:String,required:true},timezone:{type:String,required:true},snoozes:[{_id:false,key:String,scheduled:Number,until:Number}],revision:{type:Number,required:true}},{autoCreate:false,autoIndex:false});
schema.index({parentId:1,childId:1},{unique:true});
export default mongoose.model('CompanionPreference',schema);
