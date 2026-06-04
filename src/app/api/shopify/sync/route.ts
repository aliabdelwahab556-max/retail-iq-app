import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { shopUrl, accessToken } = await req.json();

    if (!shopUrl || !accessToken) {
      return NextResponse.json(
        { error: "Missing shopUrl or accessToken in request body." },
        { status: 400 }
      );
    }

    // Clean up domain name to ensure correct Shopify API URL format
    let cleanUrl = shopUrl.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
    if (!cleanUrl.endsWith(".myshopify.com")) {
      cleanUrl = `${cleanUrl}.myshopify.com`;
    }

    const shopifyApiUrl = `https://${cleanUrl}/admin/api/2024-04/products.json`;

    console.log(`Connecting securely server-to-server to Shopify Admin API: ${shopifyApiUrl}`);

    const response = await fetch(shopifyApiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken.trim(),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Shopify API server returned failure code: ${response.status}`, errorText);
      return NextResponse.json(
        { error: `Shopify channel synchronization failed: ${response.statusText} (${response.status})` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const shopifyProducts = data.products || [];

    // Map Shopify products to RetailIQ typed Product structures
    const mappedProducts = shopifyProducts.map((sp: any, idx: number) => {
      const firstVariant = sp.variants?.[0] || {};
      const price = Number(firstVariant.price) || 45.00;
      const cost = Number(firstVariant.compare_at_price) || Math.round(price * 0.45 * 100) / 100; // estimated cost
      const stock = Number(firstVariant.inventory_quantity) !== undefined ? Number(firstVariant.inventory_quantity) : 10;
      const sku = firstVariant.sku || `SKU-SHPFY-${100 + idx}`;
      
      // Auto-assign premium icons matching category tag or title
      let emoji = "📦";
      const title = sp.title.toLowerCase();
      const tags = (sp.tags || "").toLowerCase();
      if (title.includes("hoodie") || title.includes("jacket") || title.includes("shirt") || tags.includes("apparel")) {
        emoji = "🧥";
      } else if (title.includes("boot") || title.includes("shoe")) {
        emoji = "👢";
      } else if (title.includes("ring") || title.includes("gold") || tags.includes("jewelry")) {
        emoji = "💍";
      } else if (title.includes("watch")) {
        emoji = "⌚";
      } else if (title.includes("headphone") || title.includes("speaker")) {
        emoji = "🎧";
      } else if (title.includes("phone")) {
        emoji = "📱";
      }

      return {
        id: `shopify-${sp.id}`,
        name: sp.title,
        category: sp.product_type || "Accessories",
        price,
        cost,
        stock: stock > 0 ? stock : 15, // fallback stock
        emoji,
        sold: 0,
        sku
      };
    });

    return NextResponse.json({
      success: true,
      productsCount: mappedProducts.length,
      products: mappedProducts
    });

  } catch (error: any) {
    console.error("CORS-safe server-side sync exception:", error);
    return NextResponse.json(
      { error: `Internal Server Error during Shopify API sync: ${error.message || error}` },
      { status: 500 }
    );
  }
}
