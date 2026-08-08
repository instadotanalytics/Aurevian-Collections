// backend/controllers/cartController.js
import Cart from "../models/Cart.js";
import JewelleryProduct from "../models/JewelleryProduct.js";

const getProductSnapshot = (product) => {
  const name = product.productName || "Product";
  const image = product.thumbnail?.url || product.images?.[0]?.url || "";
  const price =
    product.pricing?.salePrice || product.pricing?.originalPrice || 0;
  const slug = product.productSlug || "";
  const seller = product.seller?.sellerId || null;
  const stock = product.inventory?.stockQuantity ?? 0;
  const inStock = product.inventory?.availability === "In Stock";
  return { name, image, price, slug, seller, stock, inStock };
};

export const getCart = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = await Cart.create({ user: userId, items: [] });
    return res.status(200).json({ success: true, data: cart });
  } catch (error) {
    console.error("❌ Get cart error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch cart",
        error: error.message,
      });
  }
};

export const addToCart = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "productId is required" });
    }

    const product = await JewelleryProduct.findOne({
      _id: productId,
      status: "Published",
      isActive: true,
    });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const snap = getProductSnapshot(product);
    if (!snap.inStock) {
      return res
        .status(400)
        .json({ success: false, message: "Product is out of stock" });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = new Cart({ user: userId, items: [] });

    const existing = cart.items.find((i) => i.product.toString() === productId);
    if (existing) {
      existing.quantity = Math.min(
        existing.quantity + Number(quantity),
        snap.stock || 99,
      );
    } else {
      cart.items.push({
        product: product._id,
        name: snap.name,
        image: snap.image,
        slug: snap.slug,
        price: snap.price,
        quantity: Math.max(1, Number(quantity)),
        seller: snap.seller,
      });
    }

    await cart.save();
    return res
      .status(200)
      .json({ success: true, message: "Added to cart", data: cart });
  } catch (error) {
    console.error("❌ Add to cart error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to add to cart",
        error: error.message,
      });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return res
        .status(400)
        .json({
          success: false,
          message: "productId and quantity are required",
        });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart)
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });

    const item = cart.items.find((i) => i.product.toString() === productId);
    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "Item not in cart" });

    if (Number(quantity) <= 0) {
      cart.items = cart.items.filter((i) => i.product.toString() !== productId);
    } else {
      item.quantity = Number(quantity);
    }

    await cart.save();
    return res
      .status(200)
      .json({ success: true, message: "Cart updated", data: cart });
  } catch (error) {
    console.error("❌ Update cart error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to update cart",
        error: error.message,
      });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: userId });
    if (!cart)
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });

    cart.items = cart.items.filter((i) => i.product.toString() !== productId);
    await cart.save();

    return res
      .status(200)
      .json({ success: true, message: "Item removed", data: cart });
  } catch (error) {
    console.error("❌ Remove from cart error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to remove item",
        error: error.message,
      });
  }
};

export const clearCart = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const cart = await Cart.findOne({ user: userId });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    return res
      .status(200)
      .json({
        success: true,
        message: "Cart cleared",
        data: cart || { items: [] },
      });
  } catch (error) {
    console.error("❌ Clear cart error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to clear cart",
        error: error.message,
      });
  }
};
