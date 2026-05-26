import re
import os

filepath = r'c:\laragon\www\TapCard\app\page.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update lucide-react imports
content = re.sub(r"import \{ ArrowRight, Smartphone, Zap, Shield, Globe, Users, Palette, CheckCircle2, QrCode, Contact, Share2 \} from 'lucide-react';",
                 "import { ArrowRight, Smartphone, Zap, Shield, Globe, Users, Palette, CheckCircle2, QrCode, Contact, Share2, ChevronDown } from 'lucide-react';", content)

# 2. Add id="features"
content = re.sub(r'<section className="relative z-10 py-32 px-6">', r'<section id="features" className="relative z-10 py-32 px-6">', content)

# 3. Add id="how-it-works"
content = re.sub(r'<section className="relative bg-zinc-950 py-32 px-6 border-t border-zinc-900">', r'<section id="how-it-works" className="relative bg-zinc-950 py-32 px-6 border-t border-zinc-900">', content)

# 4. Add FAQ state at the top of the component
state_str = """  const [stats, setStats] = useState({ users: 0, cards: 0 });
  const [openFaq, setOpenFaq] = useState<number | null>(null);"""
content = re.sub(r'  const \[stats, setStats\] = useState\(\{ users: 0, cards: 0 \}\);', state_str, content)

# 5. Insert Pricing and FAQ before Premium CTA
pricing_faq_html = """
      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-32 px-6 bg-black border-t border-zinc-900">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">Simple, transparent <br/> <span className="text-zinc-500">pricing.</span></h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 flex flex-col"
            >
              <h3 className="text-xl font-semibold mb-2">Starter</h3>
              <p className="text-zinc-400 mb-6 text-sm">Perfect for individuals starting out.</p>
              <div className="text-4xl font-bold mb-8">Free</div>
              <ul className="space-y-4 mb-8 flex-grow text-zinc-300 text-sm">
                <li className="flex gap-3 items-center"><CheckCircle2 size={18} className="text-blue-500" /> 1 Digital Business Card</li>
                <li className="flex gap-3 items-center"><CheckCircle2 size={18} className="text-blue-500" /> Basic Analytics</li>
                <li className="flex gap-3 items-center"><CheckCircle2 size={18} className="text-blue-500" /> Standard Templates</li>
              </ul>
              <Link href="/register" className="block text-center w-full py-3 rounded-full border border-zinc-700 hover:bg-zinc-800 transition-colors font-medium">Get Started</Link>
            </motion.div>

            {/* Pro */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gradient-to-b from-blue-900/20 to-zinc-900 border border-blue-500/30 rounded-3xl p-8 flex flex-col relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
              <h3 className="text-xl font-semibold mb-2">Pro</h3>
              <p className="text-zinc-400 mb-6 text-sm">For active professionals.</p>
              <div className="text-4xl font-bold mb-8">$5<span className="text-lg text-zinc-500 font-normal">/mo</span></div>
              <ul className="space-y-4 mb-8 flex-grow text-zinc-300 text-sm">
                <li className="flex gap-3 items-center"><CheckCircle2 size={18} className="text-blue-500" /> Unlimited Cards</li>
                <li className="flex gap-3 items-center"><CheckCircle2 size={18} className="text-blue-500" /> Advanced Analytics</li>
                <li className="flex gap-3 items-center"><CheckCircle2 size={18} className="text-blue-500" /> Custom NFC Programming</li>
                <li className="flex gap-3 items-center"><CheckCircle2 size={18} className="text-blue-500" /> Lead Capture</li>
              </ul>
              <Link href="/register" className="block text-center w-full py-3 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors font-medium">Upgrade to Pro</Link>
            </motion.div>

            {/* Enterprise */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 flex flex-col"
            >
              <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
              <p className="text-zinc-400 mb-6 text-sm">For teams and companies.</p>
              <div className="text-4xl font-bold mb-8">Custom</div>
              <ul className="space-y-4 mb-8 flex-grow text-zinc-300 text-sm">
                <li className="flex gap-3 items-center"><CheckCircle2 size={18} className="text-blue-500" /> Team Management</li>
                <li className="flex gap-3 items-center"><CheckCircle2 size={18} className="text-blue-500" /> Centralized Billing</li>
                <li className="flex gap-3 items-center"><CheckCircle2 size={18} className="text-blue-500" /> CRM Integrations</li>
                <li className="flex gap-3 items-center"><CheckCircle2 size={18} className="text-blue-500" /> Dedicated Manager</li>
              </ul>
              <Link href="/contact" className="block text-center w-full py-3 rounded-full border border-zinc-700 hover:bg-zinc-800 transition-colors font-medium">Contact Sales</Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="relative z-10 py-32 px-6 bg-zinc-950 border-t border-zinc-900">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">Frequently Asked Questions</h2>
            <p className="text-zinc-400">Everything you need to know about the product and billing.</p>
          </motion.div>

          <div className="space-y-4">
            {[
              { q: 'How does the NFC card work?', a: 'Our NFC cards contain a tiny microchip that sends your digital profile link to any modern smartphone when tapped against it. No app is required by the receiver.' },
              { q: 'Can I update my info after sharing?', a: 'Yes! Your card links to your digital profile. Any updates you make in your dashboard are instantly reflected for anyone who has your link or taps your card.' },
              { q: 'Is there a monthly fee?', a: 'The basic digital profile is 100% free forever. We offer a Pro plan for $5/month that includes advanced analytics, custom colors, and lead capture features.' },
              { q: 'What if they don\\'t have NFC?', a: 'Every digital profile comes with a dynamic QR code. You can have them scan the QR code from your phone screen or print it on physical marketing materials.' }
            ].map((faq, i) => (
              <div key={i} className="bg-black border border-zinc-800 rounded-2xl overflow-hidden transition-all duration-300 hover:border-zinc-700">
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-6 py-5 font-medium flex justify-between items-center focus:outline-none"
                >
                  <span className="pr-4">{faq.q}</span>
                  <ChevronDown className={`transform transition-transform duration-300 text-zinc-500 ${openFaq === i ? 'rotate-180' : ''}`} size={20} />
                </button>
                <div className={`px-6 pb-5 text-zinc-400 text-sm overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 pb-0'}`}>
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium CTA */}"""
content = re.sub(r'      \{\/\* Premium CTA \*\/\}', pricing_faq_html, content)


# 6. Replace Minimal Footer
new_footer = """
      {/* Comprehensive Footer */}
      <footer className="border-t border-zinc-900 bg-black pt-24 pb-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-12 mb-16">
          <div className="col-span-2">
            <img src="/logo-dark.png" alt="Card Setu" className="h-8 mb-6" />
            <p className="text-zinc-400 text-sm max-w-sm mb-6 leading-relaxed">
              The premium digital business card for modern professionals. Networking reimagined with a single tap.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-zinc-400">
              <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="#how-it-works" className="hover:text-white transition-colors">How it Works</Link></li>
              <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="#faq" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-zinc-400">
              <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-6">Legal</h4>
            <ul className="space-y-4 text-sm text-zinc-400">
              <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto border-t border-zinc-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-zinc-600 text-sm font-medium">
          <p>&copy; {new Date().getFullYear()} Card Setu. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-zinc-400 transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-zinc-400 transition-colors">LinkedIn</Link>
            <Link href="#" className="hover:text-zinc-400 transition-colors">Instagram</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}"""
content = re.sub(r'      \{\/\* Minimal Footer \*\/\}[\s\S]*\}\s*$', new_footer, content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated page.tsx")
