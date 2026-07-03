import { verifyDeliverable } from '../../src/verifier.js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders });
}

export async function onRequestPost({ request }) {
  try {
    const payload = await request.json();
    const report = verifyDeliverable(payload);
    return Response.json(report, { headers: corsHeaders });
  } catch (error) {
    return Response.json(
      {
        error: 'invalid_request',
        message: error instanceof Error ? error.message : 'Unable to review deliverable'
      },
      { status: 400, headers: corsHeaders }
    );
  }
}

export async function onRequestGet() {
  return Response.json(
    {
      name: 'AgentProof Review API',
      method: 'POST',
      path: '/api/verify',
      purpose: 'Review an Agent deliverable against the original task before acceptance.',
      boundary: 'Review assistant only; not an official ruling.',
      reviewMode: 'deterministic_fallback',
      methodNote: 'The public MVP uses requirement extraction, task-type templates, and deterministic coverage checks. Production review can add AI-assisted semantic analysis and evidence mapping.',
      requiredFields: ['taskDescription', 'deliverableText'],
      optionalFields: ['jobId', 'taskTitle', 'taskType', 'aspPromise', 'userConcern']
    },
    { headers: corsHeaders }
  );
}
