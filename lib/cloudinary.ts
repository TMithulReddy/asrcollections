const CLOUD_NAME = "hzxrxgf1";

export function getImageUrl(publicId: string, width?: number): string {
  // Warn about legacy images uploaded without folder prefix (broken URLs)
  if (publicId && !publicId.includes("/")) {
    console.warn(
      `[Cloudinary] Image public_id "${publicId}" has no folder prefix — this image URL will likely be broken. The image needs to be re-uploaded through the admin widget.`
    );
  }

  const transformations = ["f_auto", "q_auto"];

  if (width !== undefined) {
    transformations.push(`w_${width}`);
  }

  const transform = transformations.join(",");
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transform}/${publicId}`;
}
