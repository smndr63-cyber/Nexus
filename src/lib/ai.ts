export async function askAI(prompt:string,system='Sen NEXUS adlı Türkçe konuşan bir Discord sunucu asistanısın. Kısa, doğal ve yardımcı ol.'){
 const key=process.env.AI_API_KEY;if(!key)throw new Error('AI_API_KEY ayarlı değil.');
 const base=(process.env.AI_BASE_URL||'https://api.openai.com/v1').replace(/\/$/,'');const model=process.env.AI_MODEL||'gpt-5-mini';
 const r=await fetch(`${base}/chat/completions`,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${key}`},body:JSON.stringify({model,messages:[{role:'system',content:system},{role:'user',content:prompt}],temperature:.7})});
 if(!r.ok)throw new Error(`AI API ${r.status}: ${await r.text()}`);const j:any=await r.json();return j.choices?.[0]?.message?.content||'Yanıt alınamadı.';
}

