# Omnichannel Strategy for PrimeOS

## Definition

Omnichannel is a business strategy that integrates sales, marketing, and customer service channels into a single synchronized system. The goal is to provide a seamless customer experience across every touchpoint.

For PrimeOS, this means a patient or lead can begin on Instagram, continue on WhatsApp, book through the website, receive reminders by email, visit the clinic, and return to post-care follow-up without losing context.

The channel changes. The relationship does not.

## PrimeOS Omnichannel Vision

PrimeOS should treat every interaction as part of one continuous patient journey.

Core channels:

- WhatsApp
- Instagram DM
- Facebook
- Website and online booking
- Phone
- Email
- In-clinic reception
- Patient portal
- CRM tasks and follow-ups
- AI assistants Clara and Luzia

Core systems:

- `Canais`: unified service inbox and conversation actions.
- `Channels`: marketing channel strategy and funnel role.
- `CRM`: patient and lead relationship record.
- `LeadsPipeline`: sales pipeline.
- `Agenda`: appointments and reminders.
- `CustomerSupport`: support tickets and service recovery.
- `AI Hub`: recommendations, next action, sentiment, lead scoring, and follow-up.

## Core Differences Between Channel Strategies

| Strategy | Definition | Customer Experience | Data Flow | PrimeOS Example |
| --- | --- | --- | --- | --- |
| Single-channel | One main channel handles the customer relationship. | Simple, but fragile. If the customer changes channel, context is often lost. | Data stays inside one channel. | Only WhatsApp is used for leads and scheduling. |
| Multi-channel | Several channels exist, but each operates independently. | Customers can choose channels, but may need to repeat information. | Data is fragmented across channels. | Instagram, WhatsApp, phone, and website all work, but teams reconcile manually. |
| Cross-channel | Some channels are connected for specific workflows. | Better continuity for selected flows, but not fully unified. | Data moves between some tools. | A website booking creates an agenda record and WhatsApp reminder, but support history remains separate. |
| Omnichannel | All channels share one customer context, one journey, and synchronized actions. | Seamless experience across marketing, sales, service, and clinic operations. | Data is centralized and event-driven. | Lead arrives by Instagram, moves to WhatsApp, books online, receives reminders, visits the clinic, and enters post-care follow-up in one timeline. |

## Operating Principles

### One Patient Identity

PrimeOS should resolve interactions into a single patient, lead, or customer profile.

Identity keys:

- Phone or WhatsApp number.
- Email.
- Patient ID.
- Lead ID.
- Social profile handle.
- Booking token.

When identity is uncertain, the system should create a possible match instead of duplicating the record silently.

### One Timeline

All meaningful touchpoints should be visible in one timeline:

- Lead source.
- Campaign touch.
- WhatsApp or DM message.
- Call.
- Appointment.
- No-show.
- Payment.
- Support ticket.
- Clinical visit.
- Follow-up.
- Feedback.

### One Next Best Action

Every lead or patient should have a recommended next action based on:

- Journey stage.
- Channel history.
- Patient status.
- Lead score.
- Appointment status.
- Payment status.
- Sentiment.
- Urgency.

### One Source of Truth

PrimeOS should keep the official relationship state in CRM entities, not inside channel-specific tools.

Channels are touchpoints. CRM is memory.

## Omnichannel Customer Journey

### 1. Awareness

Typical channels:

- Instagram
- Facebook Ads
- Google Ads
- YouTube
- Blog and SEO

PrimeOS records:

- Campaign.
- Source channel.
- Content touched.
- Lead source.
- Initial interest.

### 2. Conversion

Typical channels:

- WhatsApp
- Website booking
- Phone
- Instagram DM

PrimeOS records:

- Lead.
- Conversation channel.
- Script used.
- Appointment request.
- AI lead score.
- Next action.

### 3. Appointment

Typical channels:

- Online booking
- Google Calendar
- WhatsApp reminder
- Email reminder
- Reception phone call

PrimeOS records:

- Appointment.
- Reminder schedule.
- Confirmation status.
- No-show risk.
- Provider availability.

### 4. Clinical Experience

Typical channels:

- In-clinic reception
- EHR
- Patient record
- Document vault

PrimeOS records:

- Prontuario.
- Clinical notes.
- Treatment plan.
- Documents.
- Medical alerts.

### 5. Post-care and Retention

Typical channels:

- WhatsApp follow-up
- Email nurture
- Patient portal
- Support ticket
- Satisfaction feedback

PrimeOS records:

- Follow-up log.
- Feedback sentiment.
- Support ticket.
- Return suggestion.
- Reengagement campaign.

## Data Model Recommendations

PrimeOS already has most of the required entities.

Recommended relationship map:

- `Customer`: unified relationship profile.
- `Lead`: pre-customer sales opportunity.
- `Interaction`: canonical timeline event for CRM/service touchpoints.
- `LeadInteraction`: lead-specific sales touchpoint.
- `Channel`: customer service channel conversation.
- `MarketingChannel`: acquisition and funnel channel definition.
- `Campaign`: source campaign.
- `Appointment`: clinical booking.
- `SupportTicket`: issue or service recovery.
- `FollowUp`, `FollowUpRule`, `FollowUpLog`: retention workflows.
- `CustomerSegment`: audience targeting and personalization.

Recommended event fields:

- `customer_id`
- `lead_id`
- `patient_id`
- `channel`
- `source_platform`
- `external_conversation_id`
- `external_message_id`
- `direction`
- `intent`
- `sentiment`
- `journey_stage`
- `next_action`
- `requires_human`
- `created_at`

## AI Role in Omnichannel

AI should not replace the CRM. It should orchestrate decisions on top of trusted data.

High-value AI workflows:

- Intent classification.
- Sentiment detection.
- Lead scoring.
- Next best action.
- Suggested response.
- Return visit suggestions.
- No-show risk.
- Churn risk.
- Support triage.
- Channel routing.
- Campaign personalization.

Suggested agent boundaries:

- Clara: patient relationship, WhatsApp, post-care, service tone.
- Sales Agent: lead qualification, follow-up, objections, scheduling.
- Support Agent: ticket triage, knowledge base, escalation.
- Marketing Agent: campaign, content, segmentation, nurture.
- Codex Agent: product, engineering, integrations, automation bridge.

## Implementation Roadmap

### Phase 1: Unified Channel Documentation

- Document the omnichannel model.
- Align `Canais`, `Channels`, CRM, Agenda, and Support vocabulary.
- Define canonical stages and statuses.

### Phase 2: Timeline Normalization

- Ensure WhatsApp, Instagram, phone, website, email, agenda, and support events can become `Interaction` records.
- Create a consistent event shape for all touchpoints.
- Add deduplication rules for patient identity.

### Phase 3: Omnichannel Inbox

- Evolve `Canais` from channel launcher into a true unified inbox.
- Show patient context beside each conversation.
- Display last appointment, open tickets, lead score, payment status, and next action.

### Phase 4: AI Routing and Next Action

- Use AI to classify each conversation.
- Suggest the next action.
- Route to Clara, sales, support, or human team.
- Keep human confirmation for sensitive or irreversible actions.

### Phase 5: Analytics

- Track conversion by channel and journey stage.
- Attribute revenue to campaigns and channels.
- Measure response time, no-show reduction, reactivation, and support resolution.

## Key Metrics

Customer experience:

- First response time.
- Resolution time.
- Channel handoff success rate.
- Repeated-information rate.
- CSAT or satisfaction score.

Sales:

- Lead-to-appointment conversion.
- Appointment-to-treatment conversion.
- Channel conversion rate.
- Revenue by channel.
- Follow-up completion rate.

Marketing:

- Cost per lead.
- Cost per booked evaluation.
- Campaign assisted conversions.
- Organic vs paid channel performance.

Clinical operations:

- No-show rate.
- Reminder confirmation rate.
- Return visit completion.
- Post-care follow-up rate.

## User Experience Requirements

The interface should make continuity obvious:

- Show the patient profile next to channel conversations.
- Show source and journey stage on every lead.
- Show all recent touchpoints in one timeline.
- Let the team continue from the last known context.
- Make AI suggestions visible but editable.
- Clearly mark when human attention is required.

## Risks and Controls

| Risk | Control |
| --- | --- |
| Duplicate patients across channels | Identity matching and merge workflow. |
| AI sends wrong or sensitive message | Human approval for clinical, payment, or legal content. |
| Channel data becomes fragmented | Canonical `Interaction` events. |
| Over-automation harms patient trust | Clara tone guidelines and escalation rules. |
| Attribution becomes inaccurate | Store source, campaign, and channel on first touch and assisted touchpoints. |

## Recommended Next Product Changes

1. Add an `Omnichannel OS` page or section.
2. Extend `Canais` with CRM context cards.
3. Create a canonical timeline component reused by CRM, patient, support, and channel pages.
4. Add channel attribution to lead and appointment flows.
5. Add AI next-action suggestions into the unified inbox.
6. Add analytics for channel continuity and handoff quality.

## Summary

Omnichannel in PrimeOS means every channel becomes part of one synchronized patient relationship system.

The business value is not just more channels. It is continuity:

- One patient identity.
- One timeline.
- One next best action.
- One operating system for marketing, sales, service, clinic, and finance.
