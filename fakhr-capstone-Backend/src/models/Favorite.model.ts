import mongoose from "mongoose";
const schema = new mongoose.Schema({
 owner: {type:mongoose.Schema.Types.ObjectId, required:true, immutable:true, ref:"User"},
 kind: {type:String, required:true, enum:["doctor","institution","product"], immutable:true},
 targetId: {type:String, required:true, maxlength:120, immutable:true},
}, {timestamps:true});
schema.index({owner:1,kind:1,targetId:1},{unique:true});
export default mongoose.model("Favorite",schema);
