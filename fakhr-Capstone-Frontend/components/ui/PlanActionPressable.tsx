import React,{useState} from 'react';
import {Pressable,type PressableProps} from 'react-native';
import {planActionState} from '../../theme/planActions';
export default function PlanActionPressable({active=true,style,onHoverIn,onHoverOut,onFocus,onBlur,...props}:PressableProps&{active?:boolean}){const [hover,setHover]=useState(false),[focus,setFocus]=useState(false);return <Pressable {...props} onHoverIn={e=>{setHover(true);onHoverIn?.(e)}} onHoverOut={e=>{setHover(false);onHoverOut?.(e)}} onFocus={e=>{setFocus(true);onFocus?.(e)}} onBlur={e=>{setFocus(false);onBlur?.(e)}} style={state=>[typeof style==='function'?style(state):style,planActionState(!!props.disabled,state.pressed,hover,focus,active)]}/>;}
