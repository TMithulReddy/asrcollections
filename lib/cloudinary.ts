const CLOUD_NAME = "hzxrxgf1";

export function getImageUrl(publicId: string, width?: number): string {
  const transformations = ["f_auto", "q_auto"];

  if (width !== undefined) {
    transformations.push(`w_${width}`);
  }

  const transform = transformations.join(",");
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transform}/${publicId}`;
}
