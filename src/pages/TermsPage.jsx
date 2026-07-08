const C = {
  bg: "#0A0A0F",
  surface: "#1C1F2B",
  border: "#2A2E3D",
  amber: "#F2A93B",
  text: "#F1EDE3",
  textDim: "#9CA0AE",
};

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2
        style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 700,
          fontSize: 18,
          color: C.amber,
          marginBottom: 10,
        }}
      >
        {title}
      </h2>
      <div style={{ fontSize: 14, color: C.textDim, lineHeight: 1.75 }}>
        {children}
      </div>
    </div>
  );
}

export default function TermsPage({ onBack }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.text,
        fontFamily: "'Inter', sans-serif",
        padding: "40px 5vw 80px",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>

      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <button
          onClick={onBack}
          style={{
            background: "transparent",
            border: `1px solid ${C.border}`,
            color: C.text,
            cursor: "pointer",
            fontSize: 13,
            padding: "8px 16px",
            borderRadius: 8,
            marginBottom: 32,
          }}
        >
          ← Back
        </button>

        <h1
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: 32,
            marginBottom: 6,
          }}
        >
          Terms &amp; Conditions
        </h1>
        <p style={{ fontSize: 13, color: C.textDim, marginBottom: 40 }}>
          Last updated: July 8, 2026
        </p>

        <Section title="1. Acceptance of these Terms">
          <p>
            These Terms and Conditions ("Terms") form a binding agreement
            between you ("User," "you") and PaxeL ("PaxeL," "we," "us," "our")
            governing your access to and use of the PaxeL platform, including
            the website, mobile application, and related services (collectively,
            the "Service"). By creating an account, you confirm that you have
            read, understood, and agree to be bound by these Terms. If you do
            not agree, you must not create an account or use the Service.
          </p>
        </Section>

        <Section title="2. What PaxeL Is">
          <p>
            PaxeL is an escrow-powered peer-to-peer marketplace that facilitates
            trade between buyers and sellers who are strangers to one another,
            primarily across Nigerian states. PaxeL is not a party to the
            underlying sale of goods between a buyer and seller — we provide the
            escrow infrastructure, dispute process, and payment rails that make
            that trade safer, but the contract of sale for any item is solely
            between the buyer and the seller.
          </p>
          <p style={{ marginTop: 10 }}>
            Payments on PaxeL are processed through Nomba, a licensed
            third-party payment infrastructure provider. PaxeL does not
            independently hold a banking or deposit-taking license; funds placed
            into escrow are held via virtual accounts provisioned through
            Nomba's regulated infrastructure until release conditions are met.
          </p>
        </Section>

        <Section title="3. Eligibility and Account Registration">
          <p>
            You must be at least 18 years old and capable of forming a binding
            contract under Nigerian law to use PaxeL. You agree to provide
            accurate, current, and complete information during registration and
            to keep that information updated. You are responsible for
            maintaining the confidentiality of your login credentials and for
            all activity that occurs under your account.
          </p>
          <p style={{ marginTop: 10 }}>
            Depending on the trade value and platform requirements, you may be
            required to complete identity verification (KYC), which may include
            submission of your Bank Verification Number (BVN), National
            Identification Number (NIN), a government-issued ID, and a live
            selfie for biometric matching. You consent to this verification,
            including through our third-party identity verification partner, as
            a condition of accessing certain features.
          </p>
        </Section>

        <Section title="4. How Escrow Works">
          <p>
            When a buyer creates a trade, the agreed amount is transferred into
            escrow and locked — it is not released to the seller at this point.
            Depending on the delivery method selected:
          </p>
          <p style={{ marginTop: 10 }}>
            <strong style={{ color: C.text }}>Local dispatch:</strong> funds
            release upon the buyer's biometric confirmation of receipt at the
            point of delivery.
          </p>
          <p style={{ marginTop: 6 }}>
            <strong style={{ color: C.text }}>Long-distance waybill:</strong>{" "}
            the seller must log the assigned driver's name, phone number, bus
            company, and bus number, along with a live photo of the dispatched
            parcel, before the trade is marked as in transit. The buyer must
            then submit a live photo confirming receipt to release funds.
          </p>
          <p style={{ marginTop: 10 }}>
            If the buyer does not confirm receipt and does not raise a dispute
            within 24 hours of dispatch being logged, funds will automatically
            release to the seller. You are responsible for monitoring your
            trades and acting within this window.
          </p>
        </Section>

        <Section title="5. Disputes">
          <p>
            If a trade does not go as expected, either party may raise a dispute
            before funds are released or before the auto-release window expires.
            Once a dispute is raised, funds remain frozen pending review. PaxeL
            will assess the evidence provided by both parties, including waybill
            photos, receipt photos, and chat history, and make a determination
            in good faith. PaxeL's decision on a dispute is final within the
            platform, though nothing in these Terms limits your right to pursue
            other lawful remedies outside the platform.
          </p>
        </Section>

        <Section title="6. Fees">
          <p>
            PaxeL may charge a service fee on trades, which will be disclosed to
            you before you confirm a trade. Fees are subject to change, and any
            change will apply prospectively to trades created after the change
            takes effect.
          </p>
        </Section>

        <Section title="7. Prohibited Conduct and Items">
          <p>
            You agree not to use PaxeL to trade illegal goods, stolen goods,
            counterfeit items, weapons, controlled substances, or any item
            prohibited under Nigerian law. You agree not to attempt to
            circumvent the escrow system (for example, by arranging payment
            outside the platform to avoid fees or protections), submit false
            waybill or receipt evidence, misrepresent your identity, or use the
            Service for money laundering or any other unlawful purpose. PaxeL
            reserves the right to suspend or terminate accounts involved in
            prohibited conduct and to report suspected illegal activity to the
            appropriate authorities.
          </p>
        </Section>

        <Section title="8. Communication">
          <p>
            To protect your privacy, direct phone numbers between buyers and
            sellers are not shared through the platform, except that a dispatch
            driver's contact number is shared with the buyer once payment is
            locked in escrow. In-app chat is provided for trade communication;
            PaxeL does not monitor or filter the content of chat messages, and
            users may voluntarily share additional contact details with one
            another at their own discretion and risk.
          </p>
        </Section>

        <Section title="9. Data Protection">
          <p>
            PaxeL processes your personal data, including identity verification
            data, in accordance with the Nigeria Data Protection Act, 2023 and
            its implementing regulations. Sensitive identifiers such as your BVN
            and NIN are collected solely for identity verification purposes and
            are handled by PaxeL and our verification partners under applicable
            data protection obligations. A separate Privacy Policy, which forms
            part of these Terms by reference, describes in detail what data we
            collect, how it is used, and your rights over it.
          </p>
        </Section>

        <Section title="10. Limitation of Liability">
          <p>
            To the fullest extent permitted by law, PaxeL is not liable for
            indirect, incidental, or consequential damages arising from your use
            of the Service. PaxeL's role is limited to providing the escrow,
            verification, and payment-facilitation infrastructure; we are not
            liable for the quality, legality, or condition of goods exchanged
            between users, for delays caused by third-party logistics providers,
            or for losses arising from a user's own failure to follow the
            confirmation or dispute process within the applicable timeframes.
            Nothing in this section limits liability that cannot be excluded
            under Nigerian law, including liability for fraud or willful
            misconduct.
          </p>
        </Section>

        <Section title="11. Suspension and Termination">
          <p>
            PaxeL may suspend or terminate your account if you breach these
            Terms, provide false information, or engage in conduct that harms
            other users or the platform. You may close your account at any time,
            subject to the resolution of any trades or disputes that are in
            progress.
          </p>
        </Section>

        <Section title="12. Changes to These Terms">
          <p>
            We may update these Terms from time to time. Material changes will
            be communicated to you, and continued use of the Service after
            changes take effect constitutes acceptance of the revised Terms.
          </p>
        </Section>

        <Section title="13. Governing Law">
          <p>
            These Terms are governed by the laws of the Federal Republic of
            Nigeria. Any dispute arising from these Terms or your use of the
            Service that cannot be resolved through PaxeL's internal dispute
            process shall be subject to the exclusive jurisdiction of the courts
            of Nigeria.
          </p>
        </Section>

        <Section title="14. Contact">
          <p>
            If you have questions about these Terms, contact us at{" "}
            <span style={{ color: C.amber }}>wiszy522@gmail.com</span>.
          </p>
        </Section>
      </div>
    </div>
  );
}
