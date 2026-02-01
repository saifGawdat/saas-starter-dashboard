export interface OnboardingStep {
  id: string
  title: string
  description: string
  element?: string // CSS selector for tour highlight
  position?: "top" | "bottom" | "left" | "right"
  action?: {
    type: "link" | "click" | "wait"
    target?: string
  }
}

export interface ChecklistItem {
  id: string
  title: string
  description: string
  checkFn?: string // Function name to check completion
  href?: string
}

export const tourSteps: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to the Dashboard!",
    description:
      "Let's take a quick tour to help you get started. You can skip this at any time.",
  },
  {
    id: "sidebar",
    title: "Navigation Sidebar",
    description:
      "Use the sidebar to navigate between different sections of the dashboard. You can collapse it for more space.",
    element: '[data-tour="sidebar"]',
    position: "right",
  },
  {
    id: "dashboard",
    title: "Dashboard Overview",
    description:
      "This is your main dashboard with key metrics and quick access to common actions.",
    element: '[data-tour="dashboard-stats"]',
    position: "bottom",
  },
  {
    id: "posts",
    title: "Content Management",
    description:
      "Create and manage your posts, categories, and tags from the Content section.",
    element: '[data-tour="nav-posts"]',
    position: "right",
  },
  {
    id: "media",
    title: "Media Library",
    description:
      "Upload and organize your images and files in the Media Library.",
    element: '[data-tour="nav-media"]',
    position: "right",
  },
  {
    id: "settings",
    title: "Settings",
    description:
      "Customize your dashboard appearance, configure integrations, and manage your preferences.",
    element: '[data-tour="nav-settings"]',
    position: "right",
  },
  {
    id: "notifications",
    title: "Notifications",
    description:
      "Stay updated with real-time notifications about your content and activity.",
    element: '[data-tour="notifications"]',
    position: "bottom",
  },
  {
    id: "complete",
    title: "You're All Set!",
    description:
      "You've completed the tour. Check out the getting started checklist for next steps. Need help? Visit the Settings page.",
  },
]

export const checklistItems: ChecklistItem[] = [
  {
    id: "complete_profile",
    title: "Complete your profile",
    description: "Add your name and profile picture",
    href: "/dashboard/profile",
  },
  {
    id: "create_first_post",
    title: "Create your first post",
    description: "Write and publish your first content",
    href: "/dashboard/posts/new",
  },
  {
    id: "upload_media",
    title: "Upload media",
    description: "Add images or files to your media library",
    href: "/dashboard/media",
  },
  {
    id: "customize_settings",
    title: "Customize settings",
    description: "Configure your site name and appearance",
    href: "/dashboard/settings/general",
  },
  {
    id: "invite_team",
    title: "Invite team members",
    description: "Add collaborators to your dashboard",
    href: "/dashboard/users",
  },
]

export function getStepById(id: string): OnboardingStep | undefined {
  return tourSteps.find((step) => step.id === id)
}

export function getChecklistItemById(id: string): ChecklistItem | undefined {
  return checklistItems.find((item) => item.id === id)
}
