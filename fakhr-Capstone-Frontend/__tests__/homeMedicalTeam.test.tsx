import React from "react";
import { render } from "@testing-library/react-native";
import { HomeIllustration } from "../components/home/HomeIllustration";
jest.mock("@expo/vector-icons", () => ({ Ionicons: "Icon" }));
test("Doctors uses the supplied local medical team artwork without stretching", () => {
 const ui=render(<HomeIllustration kind="doctors" />);
 const image=ui.getByTestId("home-medical-team");
 expect(image.props.source).toEqual(require("../assets/images/home-medical-team.png"));
 expect(image.props.resizeMode).toBe("contain");
 expect(image).toHaveStyle({width:54,height:50});
});
test.each(["disability","schools","products","homeServices","sportsClubs"])("%s retains its existing illustration",kind=>{
 const ui=render(<HomeIllustration kind={kind}/>);
 expect(ui.queryByTestId("home-medical-team")).toBeNull();
});
