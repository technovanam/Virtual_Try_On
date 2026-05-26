# HairVerse — Complete AI Hairstyle App Development Guide
> **For AI Code Agent:** This document is the single source of truth. Build the entire app from this specification. Follow every section in order.

---

## 1. PROJECT OVERVIEW

**App Name:** HairVerse  
**Tagline:** Try Before You Cut.  
**Type:** AI-powered hairstyle virtual try-on mobile app  
**Platforms:** Android & iOS  
**Model:** Freemium  

### What the app does
Users upload a selfie or use live camera. The AI detects face shape, hair type, beard, and health metrics. It recommends personalized hairstyles. Users can virtually try on hairstyles, hair colors, and beard styles with realistic rendering, compare options, save results, and export them.

### Core Problems Solved
- Current apps look unrealistic
- They distort or change the user's face
- They lack personalization
- Hairstyle fitting is inaccurate

### HairVerse's Solution
- Realistic hairstyle fitting with accurate face preservation
- Personalized AI recommendations based on face shape + hair data
- Multi-angle preview and live camera try-on
- Hair health intelligence

---

## 2. TECH STACK

| Category | Technology |
|---|---|
| Mobile Framework | React Native |
| Language | JavaScript / TypeScript |
| Backend | Python + FastAPI |
| Database | Firebase Firestore |
| Authentication | Firebase Authentication |
| Cloud Storage | Firebase Storage |
| Camera | React Native Vision Camera |
| Navigation | React Navigation |
| State Management | Zustand |
| API Communication | Axios |
| Face Detection | MediaPipe |
| Face Shape Analysis | MediaPipe + Python Logic |
| Hair Region Detection | OpenCV |
| Image Processing | OpenCV |
| Hairstyle Recommendation | Python Logic Engine |
| Hairstyle Preview | Hairstyle Overlay System (PNG assets) |
| Hairstyle Assets | PNG Hairstyle Templates |
| AI Rendering | Stable Diffusion + ControlNet + IPAdapter |
| Backend Hosting | Render |
| Source Control | GitHub |
| IDE | VS Code |
| Android Testing | Android Studio |
| Error Monitoring | Firebase Crashlytics |
| Analytics | Firebase Analytics |
| Push Notifications | Firebase Cloud Messaging |
| Image CDN | Firebase CDN |
| Security | SSL/HTTPS |
| Data Format | JSON / REST API |
| Build System | Gradle |
| App Distribution (testing) | Firebase App Distribution |
| API Testing | Postman |

---

## 3. PROJECT FOLDER STRUCTURE

```
hairverse/
├── mobile/                        # React Native app
│   ├── src/
│   │   ├── screens/               # All 24 screens (see Screen List)
│   │   ├── components/            # Reusable UI components
│   │   ├── navigation/            # React Navigation setup
│   │   ├── store/                 # Zustand state stores
│   │   ├── services/              # API calls (Axios)
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── assets/                # Hairstyle PNG templates, images
│   │   ├── utils/                 # Helper functions
│   │   └── constants/             # Colors, fonts, config
│   ├── android/
│   ├── ios/
│   └── package.json
│
├── backend/                       # Python + FastAPI
│   ├── main.py
│   ├── routers/
│   │   ├── auth.py
│   │   ├── analysis.py
│   │   ├── recommendations.py
│   │   ├── tryon.py
│   │   ├── hairstyles.py
│   │   ├── users.py
│   │   └── notifications.py
│   ├── services/
│   │   ├── face_detection.py      # MediaPipe
│   │   ├── hair_analysis.py       # OpenCV
│   │   ├── face_shape.py          # Face shape logic
│   │   ├── recommendation_engine.py
│   │   ├── image_pipeline.py
│   │   └── ai_rendering.py        # Stable Diffusion pipeline
│   ├── models/                    # Pydantic models
│   ├── firebase_config.py
│   ├── requirements.txt
│   └── .env
│
└── README.md
```

---

## 4. ENVIRONMENT SETUP

### Mobile (.env)
```
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
BACKEND_BASE_URL=https://your-backend.onrender.com
```

### Backend (.env)
```
FIREBASE_SERVICE_ACCOUNT_JSON=
STABLE_DIFFUSION_API_KEY=
OPENAI_API_KEY=
SECRET_KEY=
```

---

## 5. COMPLETE SCREEN LIST & SPECIFICATIONS

There are **24 pages** total. Build each one exactly as described.

---

### PAGE 1 — SPLASH SCREEN

**Purpose:** Branding, app initialization, session checking.

**Flow:** App Open → Splash Screen → Auth Check → Login / Dashboard / Error

**UI Sections:**
- HairVerse logo centered
- AI hairstyle icon with animation
- App name "HairVerse" and tagline "Try Before You Cut."
- Loading bar / spinner
- Animated text: "Initializing AI Engine..." → "Preparing Hairstyle Intelligence..." → "Loading Virtual Try-On..."
- Futuristic gradient background with glowing particle effects and AI wave animation

**Logic:**
1. On mount, check Firebase Auth session token
2. Check internet connectivity
3. If valid session → navigate to Dashboard
4. If no session → navigate to Login
5. If no internet → show retry button
6. If server unreachable → show temporary error with retry

**Validations:**
| Condition | Response |
|---|---|
| No internet | Show retry option |
| Server unavailable | Show error message |
| Invalid session | Redirect to Login |

**Navigation:**
- → Login Page
- → Dashboard
- → Error Screen

---

### PAGE 2 — LOGIN PAGE

**Purpose:** Secure user authentication.

**Flow:** Login → Auth → Dashboard / Profile Setup

**UI Sections:**
- HairVerse logo + welcome text + tagline
- Email / Username input field
- Password input with show/hide toggle
- "Keep me logged in" checkbox
- Login button (primary CTA)
- "Forgot Password" text link
- "Continue with Google" button (OAuth)
- "Create Account" text link
- Language selection dropdown

**Logic:**
1. Validate email format before submitting
2. On login: call Firebase Auth `signInWithEmailAndPassword`
3. On Google: call Firebase Auth `signInWithPopup` (Google provider)
4. On success: check if profile is complete → Dashboard or Profile Setup
5. Store session if "Keep me logged in" is checked

**Validations:**
| Condition | Response |
|---|---|
| Empty fields | Show inline validation errors |
| Invalid email format | "Enter a valid email address" |
| Wrong password | "Incorrect password. Try again." |
| No internet | Show retry option |

**Navigation:**
- → Dashboard
- → Signup Page
- → Forgot Password
- → Profile Setup

---

### PAGE 3 — SIGNUP PAGE

**Purpose:** Create new user account.

**Flow:** Signup → Account Creation → Profile Setup

**UI Sections:**
- HairVerse logo + welcome message + onboarding intro text
- Username input
- Email input
- Password input with strength indicator
- Confirm Password input
- Password rules displayed: min 8 chars, uppercase, number, special character
- "Create Account" button
- "Continue with Google" button
- "Already have account? Login" link
- Terms & Conditions + Privacy Policy checkbox (required)

**Logic:**
1. Validate all fields
2. Check password rules in real time (show green/red per rule)
3. On submit: call Firebase Auth `createUserWithEmailAndPassword`
4. Store username in Firestore `users` collection
5. On Google signup: `signInWithPopup`
6. After account creation → navigate to Profile Setup

**Validations:**
| Condition | Response |
|---|---|
| Empty fields | Inline validation |
| Invalid email | Email format error |
| Weak password | Show failed rules in red |
| Password mismatch | "Passwords do not match" |
| Email already used | "An account with this email already exists" |
| Terms not accepted | Block submission |

**Navigation:**
- → Profile Setup
- → Login

---

### PAGE 4 — PROFILE SETUP PAGE

**Purpose:** Collect user preferences for personalized AI recommendations.

**Flow:** Signup → Profile Setup → Onboarding / Dashboard

**UI Sections:**
- Progress bar at top (step indicator)
- Welcome message
- Full Name input
- Age input (number)
- Gender selector (Male / Female / Other / Prefer not to say)
- Preferred Hair Length selector (Short / Medium / Long)
- Hairstyle Types multi-select chips (Fade, Korean, Curly, Wolf Cut, Professional, etc.)
- Hair Goals multi-select (Volume, Shine, Growth, Damage Repair)
- Preferred Hair Color chips
- Beard Preferences (Full Beard / Fade Beard / Mustache / Clean Shave)
- Style Quiz section:
  - Trendy or Professional? (toggle)
  - Minimal or Bold? (toggle)
  - Celebrity-inspired? (yes/no)
  - Open to hair color? (yes/no)
- "Save & Continue" button
- "Skip" button (uses defaults)

**Logic:**
1. Save all data to Firestore `users/{uid}/profile`
2. If skipped, save empty profile with defaults
3. Navigate to Onboarding after save

**Validations:**
| Condition | Response |
|---|---|
| Empty required fields | Inline validation |
| Invalid age | "Enter a valid age" |
| No style selected | Suggest at least one preference |

**Navigation:**
- → Onboarding
- → Dashboard (if skip)
- → AI Style Quiz

---

### PAGE 5 — ONBOARDING / APP INTRODUCTION FLOW

**Purpose:** Multi-step onboarding to introduce features, collect quiz preferences, and request permissions.

**Flow:** Profile Setup → Slides → AI Style Quiz → Permissions → Dashboard

**Slides (full-screen swipeable):**

**Slide 1 — Welcome**
- "Try Before You Cut." headline
- Animated AI hairstyle illustration
- Short description of core feature

**Slide 2 — AI Try-On Intro**
- Show realistic hairstyle preview demo
- "See exactly how you'll look. Face preserved. Hairstyle changed."

**Slide 3 — AI Recommendation Intro**
- Face shape analysis graphic
- Beard matching, hair texture analysis, celebrity styles

**Slide 4 — Live Camera Intro**
- Real-time hairstyle preview animation
- "Try on live. Switch styles instantly."

**Slide 5 — AI Style Quiz**
Fields to collect:
- Preferred Style Type (Trendy / Professional / Casual)
- Hair Length preference (Short / Medium / Long)
- Style Preference (Minimal / Bold)
- Hair Color Interest (Yes / No)
- Celebrity Style Interest (Yes / No)
- Beard Preference (Yes / No)

**Slide 6 — Permissions**
- Request Camera permission
- Request Gallery/Storage access
- Explain why each is needed

**Final Screen**
- "Your AI Hairstyle Experience Is Ready."
- "Start Exploring" button → Dashboard

**Logic:**
1. Save quiz data to Firestore profile
2. Request permissions using React Native permission API
3. On permission denied: show "retry" with explanation

**Navigation:**
- → AI Style Quiz
- → Permission Request
- → Dashboard

---

### PAGE 6 — MAIN DASHBOARD / HOME PAGE

**Purpose:** Main discovery hub.

**Flow:** Dashboard → Feature Selection → Try-On / Save / Compare / Download

**UI Sections:**

| Section | Details |
|---|---|
| Header | Profile avatar, Search bar, Notification bell |
| AI Try-On Hero | Three CTA cards: "Upload Photo", "Live Camera", "Try Trending" |
| Recommended For You | Horizontal scroll of hairstyle cards with suitability %, maintenance level, trending badge |
| Trending Hairstyles | Category chips: Korean, Fade, Curly, Wolf Cut, Buzz Cut, Celebrity, Professional |
| Quick Categories | Icon grid: Men, Women, Beard, Hair Colors, Trendy, Office |
| Recently Tried | Horizontal scroll of past try-ons |
| Saved Collections | Preview of saved folders |
| AI Insights | Hair density, health, texture, growth tips (summary card) |
| Celebrity Match | Celebrity look cards with similarity % |
| Continue Try-On | Resume incomplete sessions |
| Bottom Navigation | Home · Try-On · Search · Saved · Profile |

**Data to Fetch on Load:**
- Personalized recommendations from backend `/recommendations`
- Trending hairstyles from Firestore
- Recent try-ons from Firestore `users/{uid}/history`
- Saved collections from Firestore `users/{uid}/saved`
- AI insights from last analysis result

**Logic:**
- If no recommendations: show "Suggested Styles" fallback
- If no internet: show offline state with retry
- If saved items empty: show "Explore Styles" CTA

**Navigation:**
- Upload Photo → Image Upload Page
- Live Camera → Live Camera Try-On Page
- Hairstyle Card → Hairstyle Detail Page
- Search bar → Search Page
- Saved Collections → Saved Page
- Profile icon → Profile Page

---

### PAGE 7 — IMAGE INPUT / PHOTO UPLOAD PAGE

**Purpose:** Upload or capture face photo for AI analysis.

**Flow:** Dashboard → Upload → Image Validation → AI Analysis

**UI Sections:**
- Back button + Page title "Upload Photo" + Help icon
- Three upload options (large cards):
  1. "Upload from Gallery" — opens gallery picker
  2. "Take Photo" — opens camera for selfie
  3. "Live Camera Try-On" — opens live camera page
- Face alignment guide overlay (oval outline + guidelines)
- Lighting tips text
- Image preview after selection (zoomable)
- Crop / Retake / Replace image options
- "Continue" primary button

**Live Camera Controls (if selected):**
- Change hairstyle button
- Switch color button
- Compare button
- Pause/Capture button

**Logic:**
1. After image selected: run client-side pre-validation
   - Check image is not blurry (sharpness threshold)
   - Check face is detectable (MediaPipe quick check)
   - Check lighting level
2. On "Continue": send image to backend `/analysis/upload`
3. Show loading state during upload

**Validations:**
| Condition | Response |
|---|---|
| No face detected | "No face found. Please use a clear front-facing photo." |
| Multiple faces | "Please use a photo with only one face." |
| Blurry image | "Image is blurry. Please retake." |
| Poor lighting | "Lighting is too dark. Try in better light." |
| Extreme angle | "Please use a front-facing photo." |

**Navigation:**
- Continue → AI Analysis Page
- Camera → Preview Page
- Live Camera → Live Try-On Page
- Invalid image → Retry Upload

---

### PAGE 8 — AI ANALYSIS PROCESS & RESULT PAGE

**Purpose:** Process uploaded image and display full AI intelligence output.

**Flow:** Image Upload → AI Processing → Analysis Results → Recommendations / Try-On

**UI Sections:**

**Processing Screen (while loading):**
- Animated face mesh scanning graphic
- Progress bar with steps:
  1. "Detecting Face..." 
  2. "Analyzing Hair..."
  3. "Checking Beard Compatibility..."
  4. "Generating Recommendations..."
- Percentage counter

**Results Screen (after processing):**

| Card | Content |
|---|---|
| Face Analysis | Detected face shape (Oval/Round/Square/Diamond/Heart/Oblong), jawline type, forehead type, symmetry score |
| Hair Analysis | Hair type (Straight/Wavy/Curly/Coily), texture (Smooth/Frizzy), density (Thin/Medium/Thick), thickness, volume, hairline type, overall hair health score |
| Beard Analysis | Beard density, beard compatibility score, mustache style suitability |
| Hair Health Insights | Dryness level, frizz level, damage indicators, shine score, growth suggestions |
| AI Style Insights | Top 3 suitable hairstyles, recommended hair length, best colors, trend category, maintenance level |
| Celebrity Match | 3 celebrity inspiration cards with similarity % |
| Recommendation Summary | Best hairstyle, beard style, hair color, haircare tips |

**Bottom Actions:**
- "View Recommendations" (primary)
- "Start Virtual Try-On"
- "Save Analysis"
- "Reanalyze" (re-upload)

**Backend API:**
- `POST /analysis/process` — accepts image, returns full analysis JSON
- Response includes: `face_shape`, `hair_type`, `hair_texture`, `hair_density`, `hair_health_score`, `beard_compatibility`, `recommended_styles[]`, `celebrity_matches[]`

**Validations:**
| Condition | Response |
|---|---|
| Face not detected | Prompt to re-upload |
| Low quality image | "Image quality too low. Please upload a clearer photo." |
| Processing failed | Show retry button |

**Navigation:**
- → Recommendation Page
- → Virtual Try-On
- → Saved Collections
- → Reupload Image

---

### PAGE 9 — HAIRSTYLE RECOMMENDATION PAGE

**Purpose:** Display AI-personalized hairstyle, beard, and color recommendations.

**Flow:** AI Analysis → Recommendations → Try-On / Compare / Save

**UI Sections:**
- Header: Back button, Search, Filter icon
- AI Summary Card: Face shape, hair type, density, best category, style vibe (compact summary)
- Recommended Hairstyles feed:
  - Each card: hairstyle image, name, suitability %, maintenance level badge, trend tags, celebrity inspiration name
  - "Try Now" button on each card
  - Save (heart) icon
  - Compare (compare icon)
- Hair Color Recommendations section:
  - Color swatch + name + suitability % + skin tone compatibility
- Beard Recommendations section
- Celebrity Matches section
- Trending Matches section (Korean, Fades, Textured, Celebrity trends)
- Filter panel (slide-up):
  - Hair length, maintenance level, texture, beard compatibility, celebrity styles
- Sort options: Most popular, Highest rated, Most suitable, Trending, Latest

**Logic:**
- Fetch from backend: `GET /recommendations?uid={uid}`
- Apply filters client-side
- Lazy load images

**Navigation:**
- Try Now → Virtual Try-On
- Card tap → Hairstyle Detail
- Compare → Comparison Page
- Save → add to Firestore `users/{uid}/saved`
- Filters → filter current list

---

### PAGE 10 — VIRTUAL TRY-ON PAGE

**Purpose:** Core feature. Preview AI hairstyles on user's face photo.

**Flow:** Recommendations → Try-On → Compare / Save / Download

**UI Sections:**
- Header: Back, hairstyle name, Save icon, Share/Export icon
- **Main Preview Area** (full-width, tall): User's face with AI-generated hairstyle overlaid. Realistic texture, shadows, edge blending.
- Hairstyle Controls:
  - Left/right arrows to browse styles
  - Category selector tabs (Korean, Fade, Curly, etc.)
- Hair Color Controls:
  - Color swatches: Black, Brown, Blonde, Ash Gray, Silver, Burgundy + "Custom" picker
- Beard Controls:
  - Beard style thumbnails: Clean Shave, Light, Full, Fade, Mustache
  - Beard density slider
- Preview Controls:
  - Zoom in/out pinch gesture
  - Rotate view button
  - Intensity slider (for overlay opacity/realism)
- Multi-Angle Preview:
  - Tabs: Front, Left, Right, Semi-Side
- Comparison Tools:
  - Slider comparison (swipe left-right between original and styled)
  - Side-by-side mode
  - Multi-style grid (compare up to 4)
- Save & Export:
  - Save to Collections button
  - HD Export button
  - Before/After export button
- Live AI Camera button (switch to live mode)

**Backend API:**
- `POST /tryon/generate` — accepts: `image_id`, `hairstyle_id`, `hair_color`, `beard_style` → returns rendered image URL
- `POST /tryon/live` — WebSocket stream for live camera

**Logic:**
1. Load user image from Firebase Storage
2. On style/color/beard change: call backend render API
3. Show loading skeleton while rendering
4. Cache recent renders to avoid re-fetching

**Validations:**
| Condition | Response |
|---|---|
| Rendering failed | Show retry |
| Face mismatch | "Please reposition or use another photo" |
| Low quality preview | Suggest re-uploading a higher quality image |

**Navigation:**
- → Comparison Page
- → Saved Collections
- → Recommendation Page
- → Export Flow

---

### PAGE 11 — HAIRSTYLE DETAIL PAGE

**Purpose:** Full detailed view of a single hairstyle.

**Flow:** Recommendation / Search → Detail → Try-On / Compare / Save

**UI Sections:**
- Header: Back, hairstyle name, Save (heart) button
- Hairstyle Preview: Front + Side + AI demo preview (3 image tabs)
- Main Info Card: Name, style category, trend category, popularity level (Hot/Rising/Classic), suitability score
- Suitability Insights: Compatible face shapes, hair types, beard compatibility, age range, professional/trendy score
- Hair Length Requirements: Min hair length, top length, side length, fade level, beard compatibility
- Maintenance Details: Maintenance level (Low/Medium/High), styling difficulty, daily styling time, product types needed
- Product Suggestions: Wax, clay, texture powder, curl cream, volume spray (with Amazon/search link)
- Beard Match: 3 beard preview thumbnails with compatibility %
- Hair Color Match: Color swatches with trend tags and skin tone tags
- Celebrity Inspiration: 3 celebrity photo cards with similarity %
- Trend Insights: Trending score, viral score, seasonal popularity chart
- AI Insight: Personalized "Why this suits you" explanation (from analysis data)
- Related Hairstyles: Horizontal scroll of similar cuts
- Action buttons: "Try Now", "Compare", "Save", "Share Style"

**Navigation:**
- Try Now → Virtual Try-On
- Compare → Comparison Page
- Save → Saved Collections
- Related Hairstyle → Another Hairstyle Detail

---

### PAGE 12 — SEARCH & FILTER PAGE

**Purpose:** Search and discover hairstyles with filtering.

**Flow:** Dashboard → Search → Results → Detail / Try-On

**UI Sections:**
- Header: Back, Search input (auto-focused), Microphone icon (voice search), Filter button
- Trending Searches: Horizontal scroll pills (Korean textured cuts, Modern fades, Celebrity cuts, Viral hairstyles)
- Quick Categories: Icon grid (Men, Women, Curly, Fade, Korean, Beard, Trendy, Office, Celebrity)
- Advanced Filters (slide-up panel):
  - Face shape (multi-select chips)
  - Hair type (multi-select)
  - Hair length (slider: Short → Long)
  - Maintenance level (Low/Medium/High)
  - Trend type (Trending/Classic/Viral)
  - Beard compatibility (toggle)
  - Age range (slider)
  - Hair color (color swatches)
- Sort bar: Most Popular / Highest Rated / Most Suitable / Trending / Latest
- Search Results grid:
  - Each card: hairstyle image, name, match %, category tag, maintenance badge, trending fire icon
- Search History: Recent searches list with clear option

**Logic:**
- Real-time search: debounce 300ms, call `GET /hairstyles/search?q={query}`
- Filter: apply client-side on result set
- Voice search: use React Native speech-to-text
- Save recent searches to AsyncStorage

**Validations:**
| Condition | Response |
|---|---|
| No results | "No matches. Try different keywords." + show trending suggestions |
| Bad filter combo | "Too many filters. Try removing some." |
| Empty search field | Show trending searches |

**Navigation:**
- Result card → Hairstyle Detail
- Try Now → Virtual Try-On
- Saved → Saved Collections

---

### PAGE 13 — COMPARISON PAGE

**Purpose:** Side-by-side hairstyle comparison before decision.

**Flow:** Try-On → Compare → Save / Export / Select Style

**UI Sections:**
- Header: Back, "Comparison" title, Save, Export
- Comparison Mode Selector tabs:
  - Before vs After
  - 2-Style Comparison
  - 4-Style Grid
  - Hair Color Comparison
  - Beard Comparison
- **Before vs After view:** Slider divider — drag left to see original, drag right to see styled
- **2-Style view:** Side by side, each with name + match % + maintenance level
- **4-Style Grid:** 2x2 grid of 4 rendered hairstyle previews
- **Color Comparison:** Same face, different hair colors in grid
- **Beard Comparison:** Same face, different beard styles
- AI Recommendation Panel: "AI suggests: [Best hairstyle name] — Best fit for your face shape"
- Selection Tools: Star icon to mark favorite, checkmark to select best
- Save Comparison button
- HD Export button
- Before/After Export button

**Logic:**
- Load up to 4 renders from cache or fetch from backend
- On "Mark Favorite": save to Firestore
- Comparison data stored: `users/{uid}/comparisons/{id}`

**Navigation:**
- → Saved Collections
- → Virtual Try-On
- → Hairstyle Detail
- → Export Flow

---

### PAGE 14 — SAVED COLLECTIONS & HISTORY PAGE

**Purpose:** Manage all saved hairstyles, comparisons, colors, and beard styles.

**Flow:** Save action → Collections → Retry / Compare / Export

**UI Sections:**
- Header: Back, "My Collections", Search, Sort
- Tabs:
  - **Favorites** — Saved hairstyle cards with match %, category, saved date
  - **History** — Previously tried hairstyles, colors, beard styles, analysis history
  - **Comparisons** — Saved comparison results (before/after, 2-style, 4-style)
  - **Hair Colors** — Saved colors with suitability % and matching hairstyles
  - **Beard Styles** — Saved beard looks with hairstyle compatibility
- Collection Folders: Korean Styles, Office Looks, Fade Collection, Favorite Colors (custom folders)
- Search bar within collections
- Sort: Recently saved / Highest match / Category
- Quick Actions bar: "Retry Last Hairstyle", "Open Recent Comparison", "Continue Unfinished Try-On"
- Privacy Controls (bottom): Clear history, Delete saved data, Auto-delete selfies toggle

**Logic:**
- Fetch from Firestore `users/{uid}/saved`, `users/{uid}/history`, `users/{uid}/comparisons`
- Delete: remove Firestore document
- Create folder: add Firestore document to `users/{uid}/folders`

**Navigation:**
- Saved Hairstyle → Virtual Try-On
- Saved Comparison → Comparison Page
- History item → Analysis Result
- Folder → Folder Detail

---

### PAGE 15 — PROFILE PAGE

**Purpose:** User profile, preferences, stats, and account access.

**Flow:** Dashboard → Profile → Settings / Saved / Edit

**UI Sections:**
- **Profile Card:** Profile photo, username, email, join date, style badge (e.g. "Style Enthusiast")
- Profile Actions: Edit profile, Change photo, Change password
- **Personal Style Summary:** Face shape, hair type, favorite categories, preferred hair length, beard style
- **AI Style Profile:** Most tried hairstyles, favorite trends, favorite colors, preferred maintenance level
- **Profile Stats:** Hairstyles tried count, saved styles count, comparisons made, AI recommendations used
- Quick Access Menu: Saved Collections, History, Notifications, Hair Insights, Preferences, Settings
- **Hair Insights Summary:** Hair health score, density, shine, beard compatibility, growth suggestions
- Favorite Styles: Favorite hairstyle, beard style, hair color (editable)
- Notification Preferences toggle list
- Language & Theme Settings: English/Tamil/Hindi, Dark/Light/Neon theme
- Privacy & Account: Auto-delete selfies toggle, Clear history, Logout, Delete Account, Reset Preferences

**Navigation:**
- → Settings Page
- → Saved Collections
- → Edit Profile
- → Notifications Page

---

### PAGE 16 — SETTINGS PAGE

**Purpose:** Full app configuration.

**Flow:** Profile → Settings → Manage preferences

**Sections:**

| Section | Options |
|---|---|
| Account Settings | Edit profile, Change password, Change email, Logout, Delete account |
| Personalization | Preferred categories, beard styles, hair lengths, trend preferences |
| AI Recommendation Settings | AI recommendations on/off, personalized dashboard, celebrity suggestions, haircare tips |
| Notification Settings | Trending alerts, AI alerts, haircare, sound, vibration, frequency |
| Language & Appearance | English/Tamil/Hindi, Dark/Light/Neon theme, font size, animation intensity |
| Privacy & Security | Auto-delete selfies, clear history, disable backup, biometric login, session management |
| Storage Management | Saved images size, cache usage, downloads, clear cache, optimize storage |
| Accessibility | Larger text, high contrast, reduced motion, voice assistance |
| Help & Support | FAQ, Contact, Report Issue, Feedback, Privacy Policy |
| About | App version, build number, AI engine version, company info |
| Reset Options | Reset recommendations, reset preferences, reset onboarding, factory reset |

**Navigation:**
- → Edit Profile
- → Login Page (on logout)
- → Help Center
- → Delete Account Flow

---

### PAGE 17 — NOTIFICATIONS PAGE

**Purpose:** Notification inbox for AI updates, trends, and reminders.

**Flow:** Dashboard / Profile → Notifications → Related Feature

**UI Sections:**
- Header: Back, "Notifications", "Mark All Read", Settings shortcut
- Category tabs: All / AI Recommendations / Trending Styles / Hair Insights / Saved Reminders / Updates
- **AI Recommendation Alerts:** "New hairstyle matches your face shape!" → tap → Recommendation Page
- **Trending Alerts:** Viral hairstyles, celebrity trends, seasonal, trending colors
- **Hair Insight Alerts:** Growth tips, damage alerts, texture improvement
- **Saved Reminders:** "You saved a style 7 days ago. Try it on?" → Saved Collections
- **System Updates:** New features, hairstyle packs, AI upgrades
- Notification feed items: Icon + Title + Short description + Timestamp + Category badge
- Search bar for searching notifications
- Filter: Unread / Trends / Recommendations / Updates
- Quick controls: Enable/mute all notifications, trend frequency setting

**Logic:**
- Fetch from Firestore `users/{uid}/notifications`
- Mark as read: update Firestore document
- Delete: remove document
- FCM for push delivery (Firebase Cloud Messaging)

**Navigation:**
- Recommendation notification → Recommendation Page
- Saved reminder → Saved Collections
- Trend alert → Hairstyle Detail
- Hair insight alert → Hair Insights Page

---

### PAGE 18 — HAIR INSIGHTS PAGE

**Purpose:** Detailed AI hair health report and improvement suggestions.

**Flow:** AI Analysis → Hair Insights → Suggestions → Reanalyze / Save

**UI Sections:**
- Header: Back, "Hair Insights", Refresh Analysis button
- **Hair Summary Card:** Hair type, texture, density, health score (0-100), shine level, volume
- **Hair Health Score:** Visual gauge — Excellent / Good / Average / Needs Care
- Hair Type Analysis: Straight / Wavy / Curly / Coily + Smooth / Frizzy + Thin / Medium / Thick
- **Hair Damage Analysis:** Split ends %, dryness %, frizz %, breakage risk, weak strand indicator
- **Gray Hair Analysis:** Gray % detected, distribution (patchy/uniform), color suggestions to complement
- **Hairline & Forehead Analysis:** Hairline type (Straight/Rounded/Receding/Widow's Peak), forehead type (Small/Medium/Broad)
- **Haircare Recommendations:** Personalized tip cards — growth tips, frizz control, strengthening, shine, volume
- **Product Suggestions:** Shampoo, conditioner, hair oil, serum, curl cream (generic recommendations)
- **Diet & Nutrition:** Protein-rich foods, hydration, vitamin suggestions
- **Hairstyle Suitability Insights:** "Based on your hair, these styles suit you best" → hairstyle cards
- **Progress Tracking:** Timeline chart — hair health changes, density progress, shine improvement (over multiple analyses)
- Bottom Actions: Refresh Analysis, Save Insights, Upload New Image

**Navigation:**
- → Recommendation Page
- → Virtual Try-On
- → Saved Collections
- → Reanalysis Flow

---

### PAGE 19 — LIVE CAMERA TRY-ON PAGE

**Purpose:** Real-time AI hairstyle preview using live camera.

**Flow:** Dashboard / Try-On → Live Camera → Switch Styles → Save / Compare / Export

**UI Sections:**
- Header: Back, current hairstyle name, Save, Capture
- **Full-screen live camera feed** with AI hairstyle overlay (hair only replaced, face preserved)
- AI Face Tracking indicators: Face outline, hairline tracking indicator
- **Live Controls (floating bottom panel):**
  - Hairstyle switcher (swipe left/right carousel)
  - Hair color swatches (Black/Brown/Blonde/Silver/Burgundy/Ash Gray)
  - Beard style selector
  - Compare button (enter split-screen)
  - Pause/Freeze button (freezes frame for inspection)
  - Capture button (saves current look)
- **Trending styles shortcut rail** (horizontal scroll)
- Multi-angle support info (front, slight left, slight right, semi-side)
- **AI Suggestions Panel** (collapsible): Live hairstyle recommendations, color suggestions, beard suggestions
- **Live Comparison Mode:** Swipe to reveal original / swipe to reveal styled

**Backend:**
- WebSocket connection to backend for live AI rendering stream
- Send camera frames → receive rendered overlay
- Optimize for low latency (target < 200ms round trip)

**Validations:**
| Condition | Response |
|---|---|
| Face lost from frame | "Move your face into frame" overlay |
| Low lighting | "Lighting too dark. Move to better light." |
| Multiple faces | "Only one face supported. Stay centered." |
| Camera permission denied | Request permission dialog |

**Navigation:**
- → Comparison Page
- → Saved Collections
- → Export Flow
- → Hairstyle Detail

---

### PAGE 20 — EXPORT & DOWNLOAD PAGE

**Purpose:** Save and export AI hairstyle results.

**Flow:** Try-On → Capture → Export → Download / Save

**UI Sections:**
- Header: Back, "Export", Save button
- **Preview Section:** Final result preview with hairstyle + color + beard combo
- Export Type selector tabs:
  - Single HD Image
  - Before vs After
  - 2-Style Comparison
  - 4-Style Grid
  - Live Camera Capture
- **Quality Options:** Standard / HD / Ultra HD (Ultra HD = Premium only)
- **Format Options:** JPG / PNG
- **Save to Collections:** Dropdown — Favorites, Hairstyle folders, Comparison folders, Beard collections
- Export Details card: Hairstyle name, hair color, beard style, match %, generated date
- Quick action buttons: Download, Save to Collection, Compare Again, Retry Style
- **Premium Feature Highlight:** "Unlock watermark-free HD & Ultra HD exports" (if free user)
- Export History: Previous downloads list with thumbnail

**Logic:**
1. Compose final image on backend `/export/generate`
2. On download: request storage permission → save to device gallery
3. Watermark added for free tier, removed for premium

**Validations:**
| Condition | Response |
|---|---|
| Storage permission denied | Request permission |
| Export failed | Show retry |
| Device storage low | "Low storage space. Free up space and try again." |

**Navigation:**
- → Saved Collections
- → Virtual Try-On
- → Comparison Page

---

### PAGE 21 — HELP & SUPPORT PAGE

**Purpose:** User support, FAQs, issue reporting, feedback.

**Flow:** Profile → Settings → Help & Support

**UI Sections:**
- Header: Back, "Help & Support", Search
- **Help Categories:** Account Issues, Login Problems, AI Try-On Issues, Camera Problems, Export Problems, Subscription Issues (icon cards)
- **FAQ Section:** Accordion list — "How does live try-on work?", "Why isn't my hairstyle fitting?", "How do I save styles?", "Are my selfies stored?", "Why is AI analysis inaccurate?"
- **Report Issue Form:**
  - Issue category dropdown
  - Issue title input
  - Description textarea
  - Screenshot upload
  - Device info (auto-filled)
  - Submit button
- **Feedback Section:** Rating stars (1-5) + written feedback for: App overall, AI realism, Recommendation accuracy, UX
- **Contact Support:** Email support button, Submit ticket button, Community link
- **Diagnostics:** App version, Device model, AI engine version, Internet status
- **Troubleshooting Guides:** Step-by-step cards for camera fix, upload quality, export problems
- **Privacy Help:** "How is my data used?", "How to delete selfies?", "How to delete account?"

**Navigation:**
- FAQ item → FAQ Detail
- Submit Issue → Ticket Confirmation Screen
- Feedback → Success screen
- Contact Support → External email/support URL

---

### PAGE 22 — PREMIUM / SUBSCRIPTION PAGE

**Purpose:** Premium upgrades and subscription management.

**Flow:** Free limit reached / Premium button → Subscription Page → Payment → Unlock

**UI Sections:**
- Header: Back, "Go Premium", Restore Purchase link
- **Premium Hero Banner:** "Unlimited Try-Ons. Ultra HD. No Watermark." with animated gradient
- **Benefits List:**
  - Unlimited virtual try-ons
  - Ultra-realistic AI rendering
  - Watermark-free downloads
  - Faster AI generation
  - Premium exclusive hairstyle collections
  - Advanced AI recommendations
  - Unlimited HD + Ultra HD exports
- **Free vs Premium Comparison Table**
- **Subscription Plans:**
  - Monthly — price/month
  - Quarterly — price/quarter (save X%)
  - Yearly — price/year (best value badge)
- **Free Trial:** "3-Day Free Trial — Cancel Anytime" toggle
- **Premium Preview Gallery:** Celebrity styles, exclusive trends, ultra-realistic renders
- **Payment Methods:** UPI, Credit Card, Debit Card, Apple Pay, Google Pay
- **Subscription Management (if subscribed):** Cancel, Change plan, Billing history, Renew
- **Premium Badges:** "Premium User" / "Pro AI Member" / "Unlimited Access"

**Logic:**
- Handle In-App Purchase (IAP) via `react-native-iap`
- Verify purchase server-side via backend
- Store subscription status in Firestore `users/{uid}/subscription`
- Check subscription status on app start

**Validations:**
| Condition | Response |
|---|---|
| Payment failed | Show retry with different payment method |
| Invalid transaction | "Transaction verification failed. Contact support." |
| Restore failed | "No previous purchase found." |
| Free limit reached | Show upgrade prompt modal |

**Navigation:**
- → Payment Flow (in-app)
- → Dashboard (on success)
- → Premium Activated screen

---

### PAGE 23 — ADMIN PANEL / ADMIN DASHBOARD

**Purpose:** Internal platform management (separate web app recommended, or hidden in-app admin route).

**Access:** Admin login with 2FA — admin email + password + OTP

**Sections:**

| Module | Features |
|---|---|
| Admin Login | Email, Password, 2FA OTP, Session protection |
| Dashboard Overview | Total users, active users, daily try-ons, AI processing count, premium users, revenue |
| User Management | View/search users, suspend, delete, view activity history |
| User Details | Username, email, subscription status, try-ons count, saved styles, reports |
| Hairstyle Management | Add / edit / delete hairstyles, categorize, set metadata |
| Hair Color Management | Add/remove colors, manage trending colors |
| AI Management | AI processing status, rendering success rate, face detection accuracy, GPU usage |
| AI Analytics | Rendering time avg, error rate, most selected styles, failed renders |
| Content Moderation | Review flagged images, remove harmful content, manage reports |
| Report Management | Support tickets, reply, resolve, track status |
| Premium Management | Premium users, subscriptions, refunds, revenue analytics |
| Analytics Dashboard | User retention, feature usage, popular hairstyles, conversion rate |
| Trend Management | Set trending hairstyles, celebrity promotions, seasonal content |
| Notification Management | Broadcast alerts, personalized campaigns, promotional notifications |
| Storage & Security | Uploaded images, exports, session monitoring, security alerts |
| Admin Roles | Super Admin, Content Manager, Support Admin, AI Operations Admin |
| System Health | API status, database health, AI server health, GPU usage monitoring |

**Admin Roles:**
- **Super Admin:** Full access
- **Content Manager:** Hairstyles, colors, trends
- **Support Admin:** Reports, tickets, users
- **AI Operations Admin:** AI monitoring, rendering

---

### PAGE 24 — AI SYSTEM ARCHITECTURE (Internal Flow)

**This is not a UI page — it is the backend processing pipeline. Implement in Python/FastAPI.**

```
User Image Input
       ↓
Image Validation (blur, lighting, face presence, single face, angle check)
       ↓
Face Detection (MediaPipe — detect eyes, nose, jawline, forehead, head position)
       ↓
Face Shape Analysis (MediaPipe + Python — Oval/Round/Square/Diamond/Heart/Oblong)
       ↓
Hair Segmentation (OpenCV — detect hair region, beard region, hairline boundaries)
       ↓
Hair Analysis Engine (type, texture, density, thickness, shine, damage, frizz, gray %)
       ↓
Beard Analysis (density, shape, length, mustache structure)
       ↓
AI Recommendation Engine (hairstyles, beard styles, colors, celebrity matches)
       ↓
Hairstyle Matching Engine (face compatibility, texture match, beard compatibility, trends)
       ↓
Virtual Try-On Engine (Stable Diffusion + ControlNet + IPAdapter — hair fitting, texture, shadows, edge blending)
       ↓
Live Camera Engine (face tracking, head rotation, real-time rendering — WebSocket)
       ↓
Comparison Engine (before/after, multi-hairstyle, color comparison)
       ↓
Export Engine (HD renders, comparison images, before/after exports)
       ↓
AI Learning Engine (save preferences, interactions → improve personalization over time)
       ↓
Notification AI Engine (personalized alerts, trend suggestions, haircare recommendations)
```

---

## 6. FIREBASE FIRESTORE DATA MODEL

```
/users/{uid}/
    - username
    - email
    - createdAt
    - profile/
        - fullName
        - age
        - gender
        - preferredHairLength
        - hairstyleTypes[]
        - hairGoals[]
        - preferredHairColor
        - beardPreference
        - styleQuiz{}
    - subscription/
        - status (free/premium/trial)
        - plan (monthly/quarterly/yearly)
        - expiresAt
        - billingHistory[]
    - saved/
        - hairstyles[]
        - colors[]
        - beardStyles[]
        - comparisons[]
        - folders[]
    - history/
        - tryOns[]
        - analyses[]
    - notifications/
        - {notificationId}/
            - type
            - title
            - body
            - read
            - timestamp
    - insights/
        - latest analysis result
        - progressHistory[]

/hairstyles/{hairstyleId}/
    - name
    - category
    - trendCategory
    - suitableFaceShapes[]
    - suitableHairTypes[]
    - beardCompatibility
    - maintenanceLevel
    - popularityScore
    - previewImageURL
    - sidePreviewURL
    - celebInspiration
    - productSuggestions[]
    - isTrending
    - isPremium
    - createdAt

/trending/
    - current trending hairstyle IDs list
    - updated by admin

/admin/
    - reports/
    - analytics/
    - broadcastNotifications/
```

---

## 7. BACKEND API ENDPOINTS

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | /auth/register | Create user (handled via Firebase client SDK) |
| POST | /auth/profile | Save/update profile |

### Analysis
| Method | Endpoint | Description |
|---|---|---|
| POST | /analysis/upload | Upload image, run full AI pipeline, return analysis result |
| GET | /analysis/{uid}/latest | Get latest analysis for user |
| GET | /analysis/{uid}/history | Get past analyses |

### Recommendations
| Method | Endpoint | Description |
|---|---|---|
| GET | /recommendations | Get personalized recommendations for user |
| GET | /hairstyles | Get hairstyle list with filters/search |
| GET | /hairstyles/{id} | Get single hairstyle details |
| GET | /hairstyles/search | Search hairstyles by query |
| GET | /trending | Get trending hairstyles |

### Virtual Try-On
| Method | Endpoint | Description |
|---|---|---|
| POST | /tryon/generate | Generate try-on render (returns image URL) |
| WS | /tryon/live | WebSocket for live camera try-on stream |
| POST | /tryon/compare | Generate comparison image |

### Export
| Method | Endpoint | Description |
|---|---|---|
| POST | /export/generate | Compose final export image |
| GET | /export/{uid}/history | Export history |

### Notifications
| Method | Endpoint | Description |
|---|---|---|
| POST | /notifications/send | Send notification (admin) |
| POST | /notifications/broadcast | Broadcast to all users (admin) |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | /admin/users | List users |
| POST | /admin/hairstyles | Add hairstyle |
| PUT | /admin/hairstyles/{id} | Update hairstyle |
| DELETE | /admin/hairstyles/{id} | Delete hairstyle |
| GET | /admin/analytics | Get platform analytics |
| GET | /admin/reports | Get support reports |
| POST | /admin/trending | Update trending list |

---

## 8. STATE MANAGEMENT (Zustand Stores)

```
authStore
    - user (Firebase user object)
    - isAuthenticated
    - login(), logout(), register()

profileStore
    - profile data
    - updateProfile()

analysisStore
    - currentAnalysis (face shape, hair data, recommendations)
    - isAnalyzing
    - submitImage(), clearAnalysis()

tryOnStore
    - selectedHairstyle
    - selectedColor
    - selectedBeardStyle
    - renderedImageURL
    - renderHistory[]
    - generateTryOn(), resetTryOn()

savedStore
    - savedHairstyles[]
    - savedColors[]
    - savedComparisons[]
    - folders[]
    - addToSaved(), removeFromSaved(), createFolder()

notificationsStore
    - notifications[]
    - unreadCount
    - markRead(), deleteNotification()

subscriptionStore
    - plan
    - status
    - isPremium
    - checkSubscription()

settingsStore
    - theme (dark/light/neon)
    - language
    - notifications preferences
    - privacy settings
```

---

## 9. NAVIGATION STRUCTURE (React Navigation)

```
AppNavigator
├── AuthStack (when not logged in)
│   ├── SplashScreen
│   ├── LoginScreen
│   ├── SignupScreen
│   └── ForgotPasswordScreen
│
├── OnboardingStack (after signup, before dashboard)
│   ├── ProfileSetupScreen
│   └── OnboardingScreen (slides + quiz + permissions)
│
└── MainStack (when logged in)
    ├── BottomTabNavigator
    │   ├── HomeTab → DashboardScreen
    │   ├── TryOnTab → ImageUploadScreen
    │   ├── SearchTab → SearchScreen
    │   ├── SavedTab → SavedCollectionsScreen
    │   └── ProfileTab → ProfileScreen
    │
    └── ModalStack (presented over tabs)
        ├── AIAnalysisScreen
        ├── RecommendationScreen
        ├── VirtualTryOnScreen
        ├── HairstyleDetailScreen
        ├── ComparisonScreen
        ├── LiveCameraScreen
        ├── ExportScreen
        ├── HairInsightsScreen
        ├── NotificationsScreen
        ├── SettingsScreen
        ├── HelpSupportScreen
        ├── PremiumScreen
        └── AdminScreen (admin only)
```

---

## 10. UI DESIGN SYSTEM

**Theme: Futuristic Dark**
- Background: `#0A0A0F` (near black)
- Card Background: `#12121A`
- Primary Accent: `#7C5CFC` (electric purple)
- Secondary Accent: `#00D4FF` (cyan)
- Success: `#00E676`
- Warning: `#FFD740`
- Error: `#FF5252`
- Text Primary: `#FFFFFF`
- Text Secondary: `#A0A0B0`
- Border/Divider: `#2A2A3A`

**Typography:**
- Display Font: Bold modern sans (e.g., Poppins Bold)
- Body Font: Regular weight (Poppins Regular)
- Code/Data: Monospace

**Animations:**
- Screen transitions: Slide + fade (300ms ease)
- Loading states: Skeleton shimmer
- AI scanning: Glowing mesh animation
- Buttons: Scale on press (0.97)
- Hairstyle switch: Cross-fade (200ms)

**Components to Build (Reusable):**
- `HairstyleCard` — image, name, match %, tags, save button
- `CategoryChip` — pill selector
- `AIInsightCard` — icon + metric + label
- `ColorSwatch` — circle + name + suitability
- `BeardPreviewCard` — thumbnail + label + compatibility
- `CelebCard` — photo + name + similarity %
- `ProgressBar` — for profile setup, analysis, onboarding
- `LoadingSkeleton` — shimmer placeholder
- `BottomSheet` — for filters, export options
- `ComparisonSlider` — drag to compare
- `NotificationItem` — icon + title + time + badge
- `PremiumBadge` — crown icon + label
- `StarRating` — interactive or static

---

## 11. AI RENDERING IMPLEMENTATION NOTES

### Hairstyle Overlay Approach (MVP)
For the initial version, use **PNG hairstyle asset overlays** positioned over the detected head region:
1. MediaPipe detects head keypoints (top of head, temples, hairline)
2. Scale and position hairstyle PNG asset to match head dimensions
3. Apply color tinting for hair color changes (multiply blend mode)
4. Blend edges using alpha gradient

### Advanced Rendering (Full Version)
Use **Stable Diffusion + ControlNet + IPAdapter**:
1. User image → ControlNet extracts face structure (preserve face)
2. IPAdapter conditions style from hairstyle reference image
3. Stable Diffusion inpaints hair region only
4. Post-processing with OpenCV for edge blending

### Live Camera
- MediaPipe Face Mesh: 468 landmarks at 30fps+
- Hair region mask updated per frame
- Hairstyle PNG overlay repositioned per frame based on head tracking
- For live rendering: use lightweight model (MobileNet-based)

---

## 12. HAIRSTYLE ASSETS DATABASE

Organize PNG hairstyle assets in Firebase Storage:

```
/assets/hairstyles/
    /fade/
        fade_01.png (front view — transparent background)
        fade_01_left.png
        fade_01_right.png
    /korean/
    /curly/
    /buzz/
    /wolf/
    /celebrity/
    /beard/
        beard_full_01.png
        beard_fade_01.png
        mustache_01.png
    /colors/
        (color masks or tinting applied dynamically)
```

Each hairstyle asset:
- PNG with transparent background
- Front view + Left view + Right view
- Normalized head position (top of head at top of image)
- Consistent canvas size

---

## 13. PREMIUM FEATURE GATES

| Feature | Free | Premium |
|---|---|---|
| Daily Try-Ons | 5/day | Unlimited |
| HD Exports | 2/day | Unlimited |
| Ultra HD Exports | ✗ | ✓ |
| Watermark | ✓ (on exports) | ✗ |
| Premium Hairstyle Collection | ✗ | ✓ |
| Advanced AI Rendering | Basic | Ultra-realistic |
| Comparison Styles at once | 2 | 4 |
| AI Recommendations per day | 10 | Unlimited |
| Live Camera Try-On | Limited | Unlimited |

---

## 14. MULTI-LANGUAGE SUPPORT

Support: English, Tamil, Hindi

Implementation:
- Use `react-native-i18n` or `i18next`
- JSON locale files for each language
- Language preference stored in Firestore and local settings
- Apply on app start and on settings change

---

## 15. PRIVACY & SECURITY REQUIREMENTS

- All API calls over HTTPS
- Firebase Auth token sent in Authorization header for all API calls
- Uploaded selfies stored in Firebase Storage under `users/{uid}/uploads/`
- Auto-delete selfies option: Firebase Cloud Function with schedule
- No selfies stored permanently unless user opts in
- Admin panel requires 2FA
- Biometric login option (fingerprint/FaceID) via `react-native-biometrics`
- Session management: token refresh + auto-logout on inactivity

---

## 16. ERROR HANDLING STANDARDS

All screens must handle:
1. **No internet** → Show offline state + retry button
2. **Server error (5xx)** → "Something went wrong. Please try again."
3. **Not found (404)** → "Content not available."
4. **Auth expired** → Auto-redirect to login
5. **Permission denied** → Show explanation + request permission dialog
6. **Empty states** → Meaningful empty state illustration + CTA
7. **Loading states** → Skeleton screens or spinner with progress

---

## 17. PERFORMANCE TARGETS

| Metric | Target |
|---|---|
| App cold start | < 3 seconds |
| Screen transition | < 300ms |
| Image upload + analysis | < 15 seconds |
| Try-on render (static) | < 8 seconds |
| Live camera overlay latency | < 200ms |
| Search results | < 1 second |
| Image loading (CDN) | < 2 seconds |

---

## 18. FUTURE EXPANSION (Do Not Build Now — Architecture Should Support)

- Clothing Try-On module
- Makeup Try-On module
- Eyewear Try-On module
- AI Wardrobe System
- Full Appearance Intelligence Platform

Keep AI pipeline modular (separate face detection, segmentation, rendering engines) so new try-on categories can be added without refactoring.

---

## 19. BUILD & DEPLOYMENT

### Mobile
- Development: `npx react-native run-android` / `run-ios`
- Staging: Firebase App Distribution
- Production: Google Play Store + Apple App Store
- Build: Gradle (Android) / Xcode (iOS)

### Backend
- Development: `uvicorn main:app --reload`
- Deployment: Render (Python server)
- Environment: `.env` file with all secrets
- Requirements: `requirements.txt` with all Python packages

---

## 20. CHECKLIST FOR CODE AGENT

Before marking the app complete, verify:

- [ ] All 22 user-facing pages built and navigable
- [ ] Admin panel built (Page 23)
- [ ] AI analysis pipeline running end-to-end
- [ ] Firebase Auth (email + Google) working
- [ ] Firestore data model implemented
- [ ] Try-on rendering working (at minimum PNG overlay MVP)
- [ ] Live camera working with face tracking
- [ ] Comparison feature working
- [ ] Save / Collections feature working
- [ ] Export / Download working
- [ ] Premium subscription gate working
- [ ] Notifications working (FCM)
- [ ] Multi-language working (EN, Tamil, Hindi)
- [ ] Dark / Light / Neon theme working
- [ ] All validations per screen implemented
- [ ] All navigation flows connected
- [ ] Error handling on all screens
- [ ] Offline/no-internet handling
- [ ] Auto-delete selfies privacy feature working
- [ ] Admin 2FA working
- [ ] All API endpoints implemented and tested
- [ ] Performance targets met (test with Postman + device testing)

---

*End of HairVerse Complete Development Guide*  
*Version 1.0 — Generated from full PRD, page specs, and tech stack documents*
