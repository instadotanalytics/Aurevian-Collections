// backend/controllers/wishlistController.js
import Wishlist from "../models/Wishlist.js";
import JewelleryProduct from "../models/JewelleryProduct.js";

const getProductSnapshot = (product) => {
  const name = product.productName || "Product";
  const image = product.thumbnail?.url || product.images?.[0]?.url || "";
  const price =
    product.pricing?.salePrice || product.pricing?.originalPrice || 0;
  const slug = product.productSlug || "";
  // ✅ NEW — reuses the existing shortDescription field on JewelleryProduct.
  const shortDescription = product.shortDescription || "";
  return { name, image, price, slug, shortDescription };
};

export const getWishlist = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist)
      wishlist = await Wishlist.create({ user: userId, items: [] });
    return res.status(200).json({ success: true, data: wishlist });
  } catch (error) {
    console.error("❌ Get wishlist error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist",
      error: error.message,
    });
  }
};

export const toggleWishlist = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "productId is required" });
    }

    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) wishlist = new Wishlist({ user: userId, items: [] });

    const existingIndex = wishlist.items.findIndex(
      (i) => i.product.toString() === productId,
    );

    if (existingIndex > -1) {
      wishlist.items.splice(existingIndex, 1);
      await wishlist.save();
      return res.status(200).json({
        success: true,
        message: "Removed from wishlist",
        data: wishlist,
        inWishlist: false,
      });
    }

    const product = await JewelleryProduct.findOne({
      _id: productId,
      status: "Published",
      isActive: true,
    });

    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    const snap = getProductSnapshot(product);
    wishlist.items.push({
      product: product._id,
      name: snap.name,
      image: snap.image,
      slug: snap.slug,
      shortDescription: snap.shortDescription, // ✅ NEW
      price: snap.price,
      addedAt: new Date(),
    });

    await wishlist.save();
    return res.status(200).json({
      success: true,
      message: "Added to wishlist",
      data: wishlist,
      inWishlist: true,
    });
  } catch (error) {
    console.error("❌ Toggle wishlist error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update wishlist",
      error: error.message,
    });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist)
      return res
        .status(404)
        .json({ success: false, message: "Wishlist not found" });

    wishlist.items = wishlist.items.filter(
      (i) => i.product.toString() !== productId,
    );
    await wishlist.save();

    return res.status(200).json({
      success: true,
      message: "Removed from wishlist",
      data: wishlist,
    });
  } catch (error) {
    console.error("❌ Remove from wishlist error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove item",
      error: error.message,
    });
  }
};
