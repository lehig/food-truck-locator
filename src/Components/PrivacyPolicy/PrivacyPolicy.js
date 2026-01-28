// privacyPolicy.js
// Simple, basic Privacy Policy text for a small web app.
// Update bracketed placeholders before publishing.

export const PRIVACY_POLICY = {
  title: "Privacy Policy",
  lastUpdated: "January 28, 2026", // update as needed
  sections: [
    {
      heading: "Overview",
      body: [
        "This Privacy Policy explains how we collect, use, and share information when you use our application (the “Service”).",
        "By using the Service, you agree to the collection and use of information as described in this policy."
      ]
    },
    {
      heading: "Information We Collect",
      body: [
        "We only collect information that you choose to provide when using the Service. This may include:",
        "• Email address",
        "• Username",
        "• Password (stored securely, not in plain text)",
        "• Business name",
        "• Business address/location (as provided by you)",
        "• Menu items and related details you enter"
      ]
    },
    {
      heading: "How We Use Your Information",
      body: [
        "We use the information you provide to:",
        "• Create and manage your account",
        "• Authenticate you and help keep your account secure",
        "• Display your business profile and menu information within the Service",
        "• Provide customer support and respond to your requests",
        "• Maintain, operate, and improve the Service"
      ]
    },
    {
      heading: "How We Share Your Information",
      body: [
        "We do not sell your personal information.",
        "We may share information only in the following situations:",
        "• With service providers that help us operate the Service (for example, hosting or authentication), only as needed to provide the Service",
        "• If required to comply with applicable laws or legal requests",
        "• To protect the rights, safety, and security of the Service, our users, or the public"
      ]
    },
    {
      heading: "Data Security",
      body: [
        "We take reasonable measures to protect your information.",
        "Passwords should be stored using secure, industry-standard hashing and not stored in plain text.",
        "However, no method of transmission or storage is 100% secure, and we cannot guarantee absolute security."
      ]
    },
    {
      heading: "Data Retention",
      body: [
        "We retain your information for as long as needed to provide the Service and operate our business, unless a longer retention period is required by law.",
        "You may request deletion of your account and associated information by contacting us (see “Contact”)."
      ]
    },
    {
      heading: "Your Choices",
      body: [
        "You may update or correct certain account information within the Service (if available).",
        "You may also request access to or deletion of your information by contacting us."
      ]
    },
    {
      heading: "Children’s Privacy",
      body: [
        "The Service is not intended for children under 13, and we do not knowingly collect personal information from children under 13."
      ]
    },
    {
      heading: "Changes to This Privacy Policy",
      body: [
        "We may update this Privacy Policy from time to time.",
        "If we make changes, we will update the “Last Updated” date above. Your continued use of the Service means you accept the updated policy."
      ]
    },
    {
      heading: "Contact Us",
      body: [
        "If you have questions about this Privacy Policy or your information, contact us at:",
        "• Email: support@streetfoodlocator.net"
      ]
    }
  ]
};

// Optional: helper to render as plain text (useful for a simple page)
export function privacyPolicyToPlainText(policy = PRIVACY_POLICY) {
  const lines = [];
  lines.push(policy.title);
  lines.push(`Last Updated: ${policy.lastUpdated}`);
  lines.push("");

  for (const section of policy.sections) {
    lines.push(section.heading);
    for (const paragraph of section.body) lines.push(paragraph);
    lines.push("");
  }

  return lines.join("\n");
}
