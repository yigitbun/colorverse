
import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageSquare, Globe, Github } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 font-mono">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 font-mono max-w-2xl mx-auto">
            Have questions, suggestions, or want to collaborate? We'd love to hear from you. 
            Reach out to our team and let's create something amazing together.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 font-mono">
                Send us a Message
              </h2>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-mono text-gray-700 mb-2">
                      First Name
                    </label>
                    <Input placeholder="John" className="font-mono" />
                  </div>
                  <div>
                    <label className="block text-sm font-mono text-gray-700 mb-2">
                      Last Name
                    </label>
                    <Input placeholder="Doe" className="font-mono" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-mono text-gray-700 mb-2">
                    Email
                  </label>
                  <Input 
                    type="email" 
                    placeholder="john@example.com" 
                    className="font-mono" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-mono text-gray-700 mb-2">
                    Subject
                  </label>
                  <Input 
                    placeholder="What's this about?" 
                    className="font-mono" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-mono text-gray-700 mb-2">
                    Message
                  </label>
                  <Textarea 
                    placeholder="Tell us what's on your mind..."
                    className="min-h-32 font-mono"
                  />
                </div>
                
                <Button className="w-full font-mono">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Mail className="w-6 h-6 text-blue-500 mr-3" />
                  <h3 className="text-lg font-semibold font-mono">Email Us</h3>
                </div>
                <p className="text-gray-600 font-mono mb-2">
                  For general inquiries and support
                </p>
                <a 
                  href="mailto:hello@colorverse.app" 
                  className="text-blue-500 font-mono hover:underline"
                >
                  hello@colorverse.app
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <MessageSquare className="w-6 h-6 text-green-500 mr-3" />
                  <h3 className="text-lg font-semibold font-mono">Community</h3>
                </div>
                <p className="text-gray-600 font-mono mb-2">
                  Join our Discord community
                </p>
                <a 
                  href="#" 
                  className="text-green-500 font-mono hover:underline"
                >
                  discord.gg/colorverse
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Github className="w-6 h-6 text-gray-700 mr-3" />
                  <h3 className="text-lg font-semibold font-mono">Open Source</h3>
                </div>
                <p className="text-gray-600 font-mono mb-2">
                  Contribute to our project
                </p>
                <a 
                  href="#" 
                  className="text-gray-700 font-mono hover:underline"
                >
                  github.com/colorverse
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Globe className="w-6 h-6 text-purple-500 mr-3" />
                  <h3 className="text-lg font-semibold font-mono">Follow Us</h3>
                </div>
                <p className="text-gray-600 font-mono mb-4">
                  Stay updated with the latest features
                </p>
                <div className="flex gap-4">
                  <a href="#" className="text-purple-500 font-mono hover:underline">
                    Twitter
                  </a>
                  <a href="#" className="text-purple-500 font-mono hover:underline">
                    Instagram
                  </a>
                  <a href="#" className="text-purple-500 font-mono hover:underline">
                    LinkedIn
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center font-mono">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold font-mono mb-3">
                  How are palettes generated?
                </h3>
                <p className="text-gray-600 font-mono text-sm">
                  Our AI uses advanced color theory principles and machine learning 
                  to create harmonious color combinations that work well together.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold font-mono mb-3">
                  Can I use palettes commercially?
                </h3>
                <p className="text-gray-600 font-mono text-sm">
                  Yes! All palettes on ColorVerse are free to use for personal 
                  and commercial projects without attribution required.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold font-mono mb-3">
                  How do I export palettes?
                </h3>
                <p className="text-gray-600 font-mono text-sm">
                  Click on any palette to open the detail view, then use the export 
                  button to download in formats like CSS, ASE, and more.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold font-mono mb-3">
                  Can I submit my own palettes?
                </h3>
                <p className="text-gray-600 font-mono text-sm">
                  Absolutely! Join our community to share your creations, 
                  get feedback, and inspire other designers.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
