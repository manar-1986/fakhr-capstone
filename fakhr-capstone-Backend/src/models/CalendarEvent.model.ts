import mongoose, { Schema } from "mongoose";
const schema = new Schema({
 parentId: {type: Schema.Types.ObjectId, ref:"User", required:true, immutable:true},
 childId: {type: Schema.Types.ObjectId, ref:"Child", required:true, immutable:true},
 requestId: {type:String, required:true, immutable:true},
 title: {type:String, required:true}, date: {type:String, required:true}, startTime: {type:String, required:true}, endTime: String,
 timezone: {type:String, required:true}, category: {type:String, required:true}, notes: {type:String, default:""},
 status: {type:String, enum:["scheduled","completed","cancelled"], default:"scheduled"}, revision: {type:Number, default:0},
 location:String, reminder:String, recurrence:Schema.Types.Mixed, fingerprint:{type:String,immutable:true},
 occurrenceStatus:{type:Schema.Types.Mixed,default:{}},
}, {timestamps:true});
schema.index({parentId:1,requestId:1},{unique:true});
schema.index({parentId:1,childId:1,date:1,startTime:1});
export default mongoose.model("CalendarEvent",schema);
