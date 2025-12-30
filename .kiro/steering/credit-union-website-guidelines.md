# AI First Credit Union Website Development Guidelines

## Brand Identity
- **Name**: AI First Credit Union
- **Tagline**: "Responsible Finance for an AI-Powered World"
- **Mission**: A credit union built for the AI First Council, dedicated to securing financial future with cutting-edge, ethical technology

## Design System

### Color Palette
- **Primary Blue**: `bg-blue-600` (buttons, CTAs, accents)
- **Primary Blue Hover**: `bg-blue-700`
- **Text Blue**: `text-blue-600`
- **Background**: `bg-gray-50` (body), `bg-white` (sections), `bg-gray-100` (alternating sections)
- **Text Colors**: `text-gray-900` (headings), `text-gray-600` (body), `text-gray-500` (secondary)
- **Footer**: `bg-gray-900` with `text-gray-300`

### Typography
- **Font**: Inter (Google Fonts)
- **Headings**: `font-extrabold` for hero titles, `font-bold` for section headings
- **Body**: `font-medium` for navigation, regular weight for body text

### Layout Patterns
- **Container**: `container mx-auto px-4` for consistent page width
- **Hero Sections**: `py-20 md:py-32` with gradient backgrounds `bg-gradient-to-br from-blue-100 to-white`
- **Content Sections**: `py-16` spacing
- **Cards**: `rounded-lg shadow-md` with `border border-gray-200`
- **Buttons**: `rounded-full` with `transition duration-300`

### Navigation Structure
- **Personal** (dropdown)
  - Banking
  - Home Loans
  - Auto Loans
  - Personal Loans
  - Services
  - Rates & Fees
- **Business** (dropdown)
  - Banking
  - Services
  - Loans
  - Rates & Services
- **Resources** (dropdown)
  - Help Center
  - Learn
  - Tools
  - What is?

## Content Guidelines

### Tone & Voice
- Professional yet approachable
- Emphasize AI-powered features and ethical technology
- Focus on security, transparency, and member benefits
- Use "member" instead of "customer"

### Key Messaging
- AI-powered security and fraud detection
- NCUA insured and federally backed
- Ethical and transparent AI usage
- Member-first approach
- Cutting-edge technology with human touch

### Call-to-Action Patterns
- Primary CTA: "Become a Member" / "Join Today"
- Secondary CTAs: "Learn More", "Apply Now", "Open an Account"
- Login: "Login" (top right navigation)

## Technical Requirements

### Framework
- Jekyll static site generator
- Tailwind CSS for styling
- Responsive design (mobile-first)

### File Structure
- HTML pages in root directory
- Assets in `/assets/` folder
- Images: `/assets/images/`
- Scripts: `/assets/scripts/`
- Layouts: `/_layouts/`

### Image Handling
- Replace SVG icons with actual images where appropriate
- Use `/assets/images/` path for all images
- Maintain consistent sizing and styling

### JavaScript Functionality
- Navigation handled by `main.js`
- Use `data-page` attributes for internal navigation
- Glia integration for customer support

## Page Requirements

### Standard Page Structure
1. Hero section with gradient background
2. Introductory content section
3. Feature/benefit sections with cards
4. Product/service sections
5. Call-to-action footer section

### Required Pages to Build
- Auto Loans page
- Personal Loans page
- Business Banking page
- Business Services page
- Business Loans page
- Help Center page
- Tools page
- Contact Us page
- About Us page
- Membership/Join page

### Form Requirements
- Consistent styling with `border border-gray-300 rounded-md`
- Focus states with `focus:ring-blue-500 focus:border-blue-500`
- Proper labels and accessibility
- Submit buttons matching primary CTA style