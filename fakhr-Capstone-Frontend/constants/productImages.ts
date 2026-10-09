import type { ImageSourcePropType } from "react-native";
// Existing matching illustration. Shared photoIndex values are not proof that
// an image depicts another product (e.g. the support cushion also uses index 0).
const illustrations: Record<string, ImageSourcePropType> = {
  "p-1": require("../assets/images/product-1.png"),
};
export const productIllustration = (id: string): ImageSourcePropType | undefined => illustrations[id];
