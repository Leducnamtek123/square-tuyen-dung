import "mui-image";

declare module "mui-image" {
  export interface MuiImageProps {
    loading?: "lazy" | "eager";
  }
}
