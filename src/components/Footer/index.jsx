const Footer = () => {
  return (
    <footer className="max-h-30 bg-white border-t border-amber-50 mt-auto">
      <div className="max-w-7xl mx-auto py-3 px-5 ">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <p className="text-gray-500 text-sm text-center md:text-left mb-1">
            © {new Date().getFullYear()} Serdi. Todos los derechos reservados.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="p-1 text-gray-500 hover:text-gray-700 text-sm">
              Privacy Policy
            </a>
            <a href="#" className=" p-1 text-gray-500 hover:text-gray-700 text-sm">
              Terms of Service
            </a>
            <a href="#" className="p-1 text-gray-500 hover:text-gray-700 text-sm">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
