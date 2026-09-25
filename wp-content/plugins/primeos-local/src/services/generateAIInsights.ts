import { createPrimeosClientFromRequest } from './primeosClient.ts';

Deno.serve(async (req) => {
  try {
    const primeos = createClientFromRequest(req);
    const user = await primeos.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contactId, contactType, action } = await req.json();

    // Fetch contact data
    let contact;
    if (contactType === 'lead') {
      contact = await primeos.entities.Lead.get(contactId);
    } else {
      contact = await primeos.entities.Customer.get(contactId);
    }

    // Fetch interactions
    const interactions = await primeos.entities.Interaction.filter({ 
      customer_id: contactId 
    });

    // Fetch appointments
    const appointments = await primeos.entities.CRMAppointment.filter({
      customer_id: contactId
    });

    let prompt = '';
    let responseSchema = {};

    switch (action) {
      case 'next_actions':
        prompt = `Analyze this ${contactType} and suggest 3-5 specific next actions:

Contact: ${contact.name}
Stage: ${contact.stage || contact.status}
Score: ${contact.score || 0}
Value: ${contact.estimated_value || contact.lifetime_value || 0}
Last Contact: ${contact.last_contact_date || 'Never'}
Total Interactions: ${interactions.length}
Recent Interactions: ${interactions.slice(0, 3).map(i => `${i.type}: ${i.subject}`).join(', ')}

Provide actionable, specific suggestions with priority levels.`;

        responseSchema = {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  priority: { type: "string", enum: ["high", "medium", "low"] },
                  reason: { type: "string" },
                  timing: { type: "string" }
                }
              }
            }
          }
        };
        break;

      case 'lead_score':
        prompt = `Calculate a lead score (0-100) based on this data:

Contact: ${contact.name}
Stage: ${contact.stage || contact.status}
Estimated Value: ${contact.estimated_value || 0}
Interactions: ${interactions.length}
Recent Activity: ${interactions.slice(0, 3).map(i => `${i.type} - ${i.outcome}`).join(', ')}
Source: ${contact.source}
Last Contact: ${contact.last_contact_date}

Provide score with detailed breakdown.`;

        responseSchema = {
          type: "object",
          properties: {
            score: { type: "number" },
            factors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  factor: { type: "string" },
                  impact: { type: "string", enum: ["positive", "negative", "neutral"] },
                  points: { type: "number" },
                  explanation: { type: "string" }
                }
              }
            },
            priority_level: { type: "string", enum: ["hot", "warm", "cold"] },
            recommendation: { type: "string" }
          }
        };
        break;

      case 'interaction_summary':
        prompt = `Summarize this contact's interaction history:

Contact: ${contact.name}
Total Interactions: ${interactions.length}
Interactions:
${interactions.map(i => `- ${new Date(i.created_date).toLocaleDateString()}: ${i.type} - ${i.subject} (${i.outcome})\n  ${i.description || ''}`).join('\n')}

Appointments:
${appointments.map(a => `- ${a.date} at ${a.time}: ${a.title} (${a.status})`).join('\n')}

Provide a concise executive summary highlighting key points and patterns.`;

        responseSchema = {
          type: "object",
          properties: {
            summary: { type: "string" },
            key_points: { type: "array", items: { type: "string" } },
            sentiment: { type: "string", enum: ["positive", "neutral", "negative"] },
            engagement_level: { type: "string", enum: ["high", "medium", "low"] },
            concerns: { type: "array", items: { type: "string" } },
            opportunities: { type: "array", items: { type: "string" } }
          }
        };
        break;

      case 'recommendations':
        prompt = `Based on this contact's profile and interactions, suggest personalized products/services:

Contact: ${contact.name}
Industry: ${contact.company || 'N/A'}
Budget: ${contact.estimated_value || contact.lifetime_value || 'Unknown'}
Interests: ${contact.interest || 'Not specified'}
Pain Points: ${interactions.filter(i => i.outcome === 'negative').length} concerns raised
Positive Interactions: ${interactions.filter(i => i.outcome === 'positive').length}

Recent feedback:
${interactions.slice(0, 3).map(i => i.description).join('\n')}

Suggest 3-5 tailored product/service recommendations.`;

        responseSchema = {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  product_service: { type: "string" },
                  fit_score: { type: "number" },
                  reasoning: { type: "string" },
                  expected_value: { type: "string" },
                  pitch_points: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        };
        break;

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

    const result = await primeos.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: responseSchema
    });

    return Response.json({ success: true, data: result });

  } catch (error) {
    console.error('AI Insights Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
