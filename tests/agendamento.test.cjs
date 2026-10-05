const {test} = require('node:test');
const assert = require('node:assert/strict');
const {buildWhatsAppUrl, todayInSaoPaulo, validateField} = require('../script.js');
test('mensagem leva todos os dados ao contato real, omite marca vazia e mantém acentos',()=>{
 const url = new URL(buildWhatsAppUrl([['Móvel','Guarda-roupa'],['Quantidade de móveis','2'],['Loja ou marca',''],['Bairro','Casa Verde'],['Dia preferido','2026-10-05'],['Período','Manhã'],['Nome','José'],['WhatsApp','(11) 96617-3676']]));
 assert.equal(url.origin+url.pathname,'https://wa.me/5511966173676');
 assert.equal(url.searchParams.get('text'),'Olá, Hede! Gostaria de combinar uma montagem.\n\nMóvel: Guarda-roupa\nQuantidade de móveis: 2\nBairro: Casa Verde\nDia preferido: 05/10/2026\nPeríodo: Manhã\nNome: José\nWhatsApp: (11) 96617-3676');
});
test('dia mínimo respeita São Paulo na virada do dia UTC',()=>{
 assert.equal(todayInSaoPaulo(new Date('2026-10-06T01:00:00Z')),'2026-10-05');
 assert.equal(todayInSaoPaulo(new Date('2026-10-06T04:00:00Z')),'2026-10-06');
});
test('impede passado, quantidade fracionária, campos vazios e telefone incompleto',()=>{
 const field=(type,value,required=true)=>({type,value,required});
 assert.ok(validateField(field('date','2026-10-04'),'2026-10-05'));
 assert.equal(validateField(field('date','2026-10-05'),'2026-10-05'),'');
 assert.ok(validateField(field('number','1.5')));
 assert.ok(validateField(field('number','0')));
 assert.ok(validateField(field('text','   ')));
 assert.equal(validateField(field('text','',false)),'');
 assert.ok(validateField(field('tel','12345')));
 assert.equal(validateField(field('tel','(11) 96617-3676')),'');
});
