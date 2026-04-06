export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white border-t border-gray-700 py-8">
      <div className="max-w-6xl mx-auto px-4 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4">EmoStore</h3>
            <p className="text-gray-400 text-sm">
              Your ultimate destination for emo culture, music, and lifestyle products.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/shop" className="hover:text-white transition">Shop</a></li>
              <li><a href="/aboutus" className="hover:text-white transition">About Us</a></li>
              <li><a href="/shop?category=goth" className="hover:text-white transition">Goth</a></li>
              <li><a href="/orders" className="hover:text-white transition">My Orders</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Email: hello@emostore.com</li>
              <li>Phone: (555) 123-4567</li>
              <li>Follow us on social media</li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-700 pt-6 text-center text-sm text-gray-500">
          <p>&copy; {currentYear} EmoStore. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}