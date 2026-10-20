import React from "react";
import { render } from "@testing-library/react-native";
import { Button } from "../components/ui/Button";
import { colors } from "../theme/colors";
function luminance(hex:string){const c=hex.replace("#","").match(/../g)!.map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2];}
function contrast(a:string,b:string){const l=[luminance(a),luminance(b)].sort((a,b)=>b-a);return(l[0]+.05)/(l[1]+.05);}
test.each([colors.white,colors.backgroundWash,colors.primary])("navy normal text passes AA on %s",background=>{expect(contrast(colors.text,background)).toBeGreaterThanOrEqual(4.5);});
test.each([colors.white,colors.backgroundWash])("muted normal text passes AA on %s",background=>{expect(contrast(colors.textMuted,background)).toBeGreaterThanOrEqual(4.5);});
test.each(["Continue","متابعة"])("primary button preserves brand fill with readable label: %s",title=>{const ui=render(<Button title={title} onPress={()=>{}}/>);expect(ui.getByRole("button")).toHaveStyle({backgroundColor:"#6E7CAF"});expect(ui.getByText(title)).toHaveStyle({color:"#0B093B"});});
