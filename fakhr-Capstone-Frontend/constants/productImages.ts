import type { ImageSourcePropType } from "react-native";
// Existing matching illustration. Shared photoIndex values are not proof that
// an image depicts another product (e.g. the support cushion also uses index 0).
const illustrations: Record<string, ImageSourcePropType> = {
  "p-1": require("../assets/images/product-1.png"),
  "p-2": require("../assets/images/product-2.png"),
  // Illustration only: the artwork does not verify noise-reduction performance.
  "p-3": require("../assets/images/product-3.png"),
  "p-4": require("../assets/images/product-4.png"),
};
export const productIllustration = (id: string): ImageSourcePropType | undefined => illustrations[id];
