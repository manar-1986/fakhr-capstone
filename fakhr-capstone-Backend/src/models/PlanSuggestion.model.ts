import mongoose,{Schema} from 'mongoose';
const schema=new Schema({parentId:{type:Schema.Types.ObjectId,required:true},childId:{type:Schema.Types.ObjectId,required:true},resourceId:{type:String,required:true},saved:{type:Boolean,default:false},dismissed:{type:Boolean,default:false},feedback:{type:String,default:''},answers:{type:Map,of:String,default:{}},revision:{type:Number,default:0}},{timestamps:true,autoCreate:false,autoIndex:false});
schema.index({parentId:1,childId:1,resourceId:1},{unique:true});
export default mongoose.model('PlanSuggestion',schema);
