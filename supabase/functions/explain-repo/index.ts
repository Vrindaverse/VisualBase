const SYSTEM_PROMPT = `You are a senior software architect explaining code repositories.
Provide clear, concise, and technical explanations focused on architecture and patterns.
Respond with valid JSON only.`;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      repoUrl,
      repoName,
      description,
      techStack,
      projectType,
      folderStructure,
      keyFiles 
    } = await req.json();

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      return new Response(
        JSON.stringify({ 
          explanation: generateFallbackExplanation(repoName, description, techStack, projectType)
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = `Explain this repository in detail.

Repository: ${repoName}
Description: ${description || 'No description'}
Tech Stack: ${techStack?.join(', ') || 'Unknown'}
Project Type: ${projectType || 'Unknown'}

Key Files:
${keyFiles?.slice(0, 10).join('\n') || 'None identified'}

Folder Structure:
${folderStructure || 'Not available'}

Provide a JSON response with:
{
  "overview": "2-3 sentence summary of what this project does",
  "architecture": "Description of the architecture and how components interact",
  "folderExplanations": {"path/to/folder": "brief explanation", ...},
  "fileSummaries": {"path/to/file": "brief explanation", ...},
  "techStack": ["array of technologies detected"]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 1500,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ 
          explanation: generateFallbackExplanation(repoName, description, techStack, projectType)
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const explanation = JSON.parse(data.choices[0].message.content);

    return new Response(
      JSON.stringify({
        explanation: {
          overview: explanation.overview || `A ${projectType} project using ${techStack?.join(', ')}.`,
          architecture: explanation.architecture || 'Architecture analysis unavailable.',
          folderExplanations: explanation.folderExplanations || {},
          fileSummaries: explanation.fileSummaries || {},
          techStack: explanation.techStack || techStack || [],
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        explanation: generateFallbackExplanation(repoName, description, techStack, projectType)
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateFallbackExplanation(
  repoName: string,
  description?: string,
  techStack?: string[],
  projectType?: string
) {
  return {
    overview: description || `This is a ${projectType || 'software'} project${techStack?.length ? ` built with ${techStack.slice(0, 3).join(', ')}` : ''}.`,
    architecture: `The project follows a standard ${projectType || 'application'} structure. Main components are organized in the src directory with separate folders for components, services, and utilities.`,
    folderExplanations: {},
    fileSummaries: {},
    techStack: techStack || [],
  };
}
