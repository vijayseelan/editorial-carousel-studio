#!/usr/bin/env node
const fs=require('fs');
const file=process.argv[2];
if(!file){console.error('Usage: validate_claim_register.js <claim-register.json>');process.exit(2)}
const data=JSON.parse(fs.readFileSync(file,'utf8'));
const issues=[],claims=Array.isArray(data.claims)?data.claims:[];
if(data.gateStatus!=='creator-approved') issues.push('gateStatus must be creator-approved');
if(!claims.length) issues.push('claim register must contain at least one claim');
const valid=new Set(['verified','qualified','disputed','unresolved','opinion']);
const actions=new Set(['remove','rewrite-with-qualification','research-further','retain-with-visible-dispute-label']);
for(const [i,c] of claims.entries()){
  const p=c.id||`claim ${i+1}`;
  if(!c.id||!c.proposition||!valid.has(c.status)) issues.push(`${p}: missing identity, proposition or valid status`);
  if(['verified','qualified'].includes(c.status)&&(!Array.isArray(c.sources)||!c.sources.length)) issues.push(`${p}: ${c.status} claim needs a source`);
  if(['qualified','disputed'].includes(c.status)&&!(c.safeWording||c.safe_wording)) issues.push(`${p}: safe wording is required`);
  if(['disputed','unresolved'].includes(c.status)&&!actions.has(c.creatorDecision)) issues.push(`${p}: creator decision is required`);
  if(c.status==='unresolved'&&c.creatorDecision!=='remove') issues.push(`${p}: unresolved claim must be removed or revalidated before production`);
}
if(issues.length){console.error(issues.join('\n'));process.exit(1)}
console.log(`VALID: creator-approved register with ${claims.length} claims.`);
