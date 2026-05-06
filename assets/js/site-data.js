window.LEMONS_SITE = {
  homeActions: [
    {
      href: "dashboard.html",
      icon: "fa-solid fa-compass",
      label: "Start the Business Journey"
    },
    {
      href: "entrepreneur.html",
      icon: "fa-solid fa-rocket",
      label: "Learn the Entrepreneur Mindset"
    }
  ],
  dashboardMenu: [
    { href: "dashboard.html", icon: "fa-solid fa-compass", label: "Dashboard", hint: "Return to the main hub" },
    { href: "entrepreneur.html", icon: "fa-solid fa-lightbulb", label: "Business Mindset", hint: "Learn how entrepreneurs think" },
    { href: "customize.html", icon: "fa-solid fa-pencil-alt", label: "Brand Your Stand", hint: "Name, style, and opening day" },
    { href: "calculator.html", icon: "fa-solid fa-calculator", label: "Price & Profit", hint: "Learn what each cup earns" },
    { href: "loan.html", icon: "fa-solid fa-hand-holding-usd", label: "Startup Funding", hint: "Decide if you need help" },
    { href: "marketing.html", icon: "fa-solid fa-bullhorn", label: "Spread the Word", hint: "Plan how customers find you" },
    { href: "checklist.html", icon: "fa-solid fa-list-check", label: "Ready to Open", hint: "Pack the essentials" },
    { href: "journal.html", icon: "fa-solid fa-book", label: "What Did I Learn?", hint: "Capture lessons from the day" },
    { href: "certificate.html", icon: "fa-solid fa-certificate", label: "Finish Strong", hint: "Print your certificate" },
    { href: "report.html", icon: "fa-solid fa-award", label: "Business Report", hint: "See the full story" }
  ],
  journeySteps: [
    {
      href: "entrepreneur.html",
      label: "Learn the business mindset",
      hint: "See how a small business starts with an idea",
      complete: () => true
    },
    {
      href: "customize.html",
      label: "Build the stand brand",
      hint: "Name it, style it, and set the opening day",
      complete: (store) => Boolean(store.getItem("stand-name") || store.getItem("standName") || store.getItem("slogan"))
    },
    {
      href: "calculator.html",
      label: "Plan the money side",
      hint: "Work out cost per cup, price, and profit",
      complete: (store) => Boolean(store.getItem("finalProfit") || store.getItem("totalIncome") || store.getItem("totalExpenses"))
    },
    {
      href: "loan.html",
      label: "Review startup funding",
      hint: "Decide whether a loan helps you launch",
      complete: (store) => Boolean(store.getItem("amount") || store.getItem("loanAmount") || store.getItem("repaymentPlan"))
    },
    {
      href: "marketing.html",
      label: "Plan how to spread the word",
      hint: "Choose flyers, signs, and simple messages",
      complete: (store) => Boolean(store.getItem("marketingPlan"))
    },
    {
      href: "checklist.html",
      label: "Pack the opening day checklist",
      hint: "Make sure the stand is ready to serve",
      complete: (store) => {
        try {
          return JSON.parse(store.getItem("checklistItems") || "[]").length > 0;
        } catch {
          return false;
        }
      }
    },
    {
      href: "journal.html",
      label: "Reflect on the experience",
      hint: "Write what worked, what didn’t, and what you learned",
      complete: (store) => Boolean(store.getItem("favoriteMoment") || store.getItem("proudMoment") || store.getItem("reflection1"))
    },
    {
      href: "certificate.html",
      label: "Claim the certificate",
      hint: "Put the finishing touch on the journey",
      complete: (store) => Boolean(store.getItem("studentName"))
    }
  ],
  pages: {
    index: {
      menuHref: "dashboard.html",
      menuLabel: "Go to Dashboard",
      hero: {
        icon: "fa-solid fa-lemon",
        eyebrow: "Welcome",
        title: "Lemonade Boss",
        subtitle: "Learn how to build a lemonade stand like a real business, one step at a time."
      }
    },
    dashboard: {
      menuHref: "index.html",
      menuLabel: "Back to Home"
    },
    entrepreneur: {
      menuHref: "dashboard.html",
      prev: "index.html",
      next: "customize.html",
      hero: {
        icon: "fa-solid fa-lightbulb",
        eyebrow: "Step 1",
        title: "Business Mindset",
        subtitle: "See how entrepreneurs spot a need, plan a solution, and keep learning as they go."
      }
    },
    customize: {
      menuHref: "dashboard.html",
      prev: "entrepreneur.html",
      next: "calculator.html",
      download: true,
      downloadId: "downloadReport",
      downloadAction: "print",
      hero: {
        icon: "fa-solid fa-pencil",
        eyebrow: "Step 2",
        title: "Create Your Stand",
        subtitle: "Choose a name, style, and opening day so the stand feels ready for customers."
      }
    },
    calculator: {
      menuHref: "dashboard.html",
      prev: "customize.html",
      next: "loan.html",
      download: true,
      downloadId: "downloadReport",
      nextId: "nextButton",
      hero: {
        icon: "fa-solid fa-calculator",
        eyebrow: "Step 3",
        title: "Cup Profit Calculator",
        subtitle: "Start with one batch, figure out the cost of one cup, then see how much profit each lemonade makes."
      }
    },
    loan: {
      menuHref: "dashboard.html",
      prev: "calculator.html",
      next: "marketing.html",
      download: true,
      downloadId: "downloadReport",
      downloadLabel: "Print Agreement",
      downloadAction: "print",
      hero: {
        icon: "fa-solid fa-handshake",
        eyebrow: "Step 4",
        title: "Startup Funding",
        subtitle: "Write down the terms clearly so everyone understands the startup money plan."
      }
    },
    marketing: {
      menuHref: "dashboard.html",
      prev: "loan.html",
      next: "checklist.html",
      download: true,
      downloadId: "downloadReport",
      downloadLabel: "Print Plan",
      downloadAction: "print",
      nextId: "nextButton",
      hero: {
        icon: "fa-solid fa-bullhorn",
        eyebrow: "Step 5",
        title: "Marketing Plan",
        subtitle: "Plan how customers will hear about the stand and what message they should remember."
      }
    },
    checklist: {
      menuHref: "dashboard.html",
      prev: "marketing.html",
      next: "journal.html",
      download: true,
      downloadId: "printChecklist",
      downloadLabel: "Print Checklist",
      downloadAction: "print",
      hero: {
        icon: "fa-solid fa-list-check",
        eyebrow: "Step 6",
        title: "Ready to Open",
        subtitle: "Make sure the supplies, money setup, and stand are ready before opening."
      }
    },
    journal: {
      menuHref: "dashboard.html",
      prev: "checklist.html",
      next: "certificate.html",
      download: true,
      downloadId: "downloadReport",
      downloadLabel: "Print Journal",
      downloadAction: "print",
      nextId: "nextButton",
      hero: {
        icon: "fa-solid fa-book",
        eyebrow: "Step 7",
        title: "Journal & Reflections",
        subtitle: "Think back on the day, write what happened, and capture the business lessons."
      }
    },
    certificate: {
      menuHref: "dashboard.html",
      prev: "journal.html",
      next: "report.html",
      download: true,
      downloadId: "downloadReport",
      hero: {
        icon: "fa-solid fa-certificate",
        eyebrow: "Step 8",
        title: "Your Certificate",
        subtitle: "Finish the journey and print a certificate that marks the work you put in."
      }
    },
    report: {
      menuHref: "dashboard.html",
      prev: "certificate.html",
      next: null,
      download: true,
      downloadId: "downloadReport",
      clearCache: true,
      clearCacheId: "clearCacheBtn",
      clearCacheLabel: "Clear Cache & Session Data",
      hero: {
        icon: "fa-solid fa-award",
        eyebrow: "Final step",
        title: "Business Report",
        subtitle: "Review the full story of the stand, from the first idea to the final result."
      }
    },
    parent: {
      menuHref: "index.html",
      prev: "index.html",
      next: null,
      hero: {
        icon: "fa-solid fa-user-shield",
        eyebrow: "Parent view",
        title: "Parent Guide",
        subtitle: "Review the journey, check the details, and see how the app teaches business basics."
      }
    }
  }
};
