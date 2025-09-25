/* =========================================================
   ENIGMA ÓPTICO — motor + relatório automático
   (versão baseada nos arquivos V3 que alinhamos)
   ========================================================= */

/* ---------- ASSETS ---------- */
const ASSETS = {
    bgDay: "img/fundoloja.png",
    bgNight: "img/fundoloja.png", // se tiver noturno, troque por "img/store-night.png"
    spriteNeutral: "img/desconfianca.png",
    spriteSmile: "img/feliz.png",
    spriteDoubt: "img/desconfianca.png",
    spriteSuspicious: "img/feliz.png",
};

/* ---------- HELPERS ---------- */
const $ = (sel) => document.querySelector(sel);
const $all = (sel) => [...document.querySelectorAll(sel)];

function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
function download(filename, content, type = "text/plain") {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
}
function escapeHtml(s) {
    return String(s)
        .replaceAll("&", "&amp;").replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

/* ---------- PESOS DE COMPETÊNCIAS (padrão = 1) ---------- */
const SKILL_WEIGHTS = {
    "Acolhimento": 1, "Construção de confiança": 1,
    "Descoberta/Investigação": 1, "Perguntas abertas": 1,
    "Correção de rota": 1, "Empatia": 1, "Recuperação de atendimento": 1, "Escuta ativa": 1,
    "Educação do cliente": 1, "Evitar atalhos": 1, "Orientação de jornada": 1,
    "Conexão valor-uso": 1, "Resumo e encaminhamento": 1,
    "Tratamento de objeções": 1, "Priorização": 1, "Reframe de valor": 1, "Didática": 1,
    "Convite claro": 1, "Redução de fricção": 1,
    "Gestão de tempo": 1, "Flexibilidade": 1,
    "Separação custo/valor": 1, "Transparência": 1,
    "Acolhimento emocional": 1, "Explicação técnica": 1,
    "Prova social": 1, "Demonstração": 1,
    "Fechamento": 1, "Compromisso": 1, "Organização": 1,
    "Retenção": 1, "Comunicação": 1,
};

/* ---------- STORY (V3 resumida conforme arquivos) ---------- */
const STORY = {
    // C1 — Entrada
    C1: {
        id: "C1", title: "Entrada", sprite: "neutral",
        text: "Oi! Nunca usei óculos. Vim tirar dúvidas.",
        hint: "Acolha, use o nome e descubra o motivo da visita.",
        choices: [
            {
                label: "Seja bem-vindo(a)! Como posso te chamar? O que te trouxe hoje?",
                next: "C2", delta: +2, type: "Ideal",
                skills: ["Acolhimento", "Construção de confiança"],
                feedback: { short: "Ótima abordagem!", coach: "Apresente-se e use o nome do cliente." }
            },
            {
                label: "Temos promoções ótimas de armação!",
                next: "C1B", delta: -1, type: "Risco",
                skills: ["Acolhimento", "Escuta ativa"],
                feedback: { short: "Foco precoce em preço.", coach: "Diagnóstico antes de promoção." }
            },
            {
                label: "(silêncio) Fique à vontade, se precisar me chame.",
                next: "C1C", delta: -2, type: "Risco",
                skills: ["Acolhimento"],
                feedback: { short: "Faltou acolhimento.", coach: "Puxe e guie a conversa." }
            },
        ]
    },

    C1B: {
        id: "C1B", title: "Desconexão inicial", sprite: "doubt",
        text: "Ah, eu nem sei se preciso comprar agora...",
        hint: "Corrija o foco com empatia.",
        choices: [
            {
                label: "Desculpa, vamos entender sua rotina para te orientar melhor?",
                next: "C2", delta: +1, type: "Recuperação",
                skills: ["Correção de rota", "Empatia"],
                feedback: { short: "Boa correção de rota.", coach: "Admitir foco errado gera confiança." }
            },
            {
                label: "Essa armação aqui está com 50% de desconto!",
                next: "F_BAD", delta: -2, type: "Risco",
                skills: ["Educação do cliente"],
                feedback: { short: "Pressão sem diagnóstico.", coach: "Evite insistir em preço." }
            },
            {
                label: "Posso anotar seu contato e te mandar informações?",
                next: "C6CT", delta: 0, type: "Médio",
                skills: ["Retenção", "Comunicação"],
                feedback: { short: "Follow-up é melhor que perder.", coach: "Tente retomar a anamnese ainda na loja." }
            },
        ]
    },

    C1C: {
        id: "C1C", title: "Cliente inseguro", sprite: "doubt",
        text: "Tudo bem, acho que volto depois.",
        hint: "Recupere com escuta ativa.",
        choices: [
            {
                label: "Posso anotar seu contato e te mandar infos?",
                next: "C6CT", delta: 0, type: "Médio",
                skills: ["Retenção", "Comunicação"],
                feedback: { short: "Melhor que perder.", coach: "Prometa retorno útil, não spam." }
            },
            {
                label: "Ok, tchau.",
                next: "F_BAD", delta: -3, type: "Risco",
                skills: ["Acolhimento"],
                feedback: { short: "Atendimento interrompido.", coach: "Tente resgatar a conversa." }
            },
            {
                label: "Desculpa se não te atendi de pronto. Como posso ajudar agora?",
                next: "C2", delta: +1, type: "Recuperação",
                skills: ["Recuperação de atendimento", "Escuta ativa"],
                feedback: { short: "Boa recuperação.", coach: "Assuma a falha e recomece." }
            },
        ]
    },

    // C2 — Anamnese
    C2: {
        id: "C2", title: "Anamnese", sprite: "neutral",
        text: "Sinto dor de cabeça lendo e à noite me atrapalho ao dirigir.",
        hint: "Explore rotina/uso (sem diagnosticar).",
        choices: [
            {
                label: "Como é seu dia? Tela, leitura, direção, hobbies?",
                next: "C3", delta: +2, type: "Ideal",
                skills: ["Descoberta/Investigação", "Perguntas abertas"],
                feedback: { short: "Perguntas abertas bem usadas.", coach: "Funil: rotina → sintomas → impacto → objetivos." }
            },
            {
                label: "Tenho um óculos pronto que resolve!",
                next: "C2B", delta: -2, type: "Risco",
                skills: ["Evitar atalhos", "Educação do cliente"],
                feedback: { short: "Atalho perigoso.", coach: "Exame evita frustração." }
            },
            {
                label: "Sem receita não tem como, tem que trazer.",
                next: "C2C", delta: -1, type: "Médio",
                skills: ["Orientação de jornada"],
                feedback: { short: "Faltou solução local.", coach: "Apresente a clínica parceira já." }
            },
        ]
    },

    // ... (demais cenas seguem o V3 que alinhamos)

    C3: {
        id: "C3", title: "Explorar necessidades", sprite: "neutral",
        text: "Trabalho 8h no computador e dirijo à noite.",
        hint: "Conecte sintomas ao uso e convide ao exame.",
        choices: [
            {
                label: "Antes do convite, tem alguma preocupação? Tempo, custo, medo?",
                next: "C3O", delta: +1, type: "Bom",
                skills: ["Tratamento de objeções", "Priorização"],
                feedback: { short: "Mapeou barreiras.", coach: "Priorize a maior objeção." }
            },
            {
                label: "Resumindo: suas queixas combinam com avaliação visual. Vamos ao exame?",
                next: "C4", delta: +3, type: "Ideal",
                skills: ["Conexão valor-uso", "Resumo e encaminhamento"],
                feedback: { short: "Conexão excelente.", coach: "Resuma necessidades e convide." }
            },
            {
                label: "Nossos preços estão ótimos hoje!",
                next: "C3P", delta: -2, type: "Risco",
                skills: ["Reframe de valor"],
                feedback: { short: "Preço cedo demais.", coach: "Preço faz sentido após diagnóstico." }
            }
        ]
    },

    C3O: {
        id: "C3O", title: "Objeções primeiro", sprite: "doubt",
        text: "Tenho medo de gastar/tempo/resultado...",
        hint: "Mapeie a maior preocupação.",
        choices: [
            {
                label: "O que mais te preocupa hoje?", next: "C5H", delta: +1, type: "Ideal",
                skills: ["Tratamento de objeções", "Escuta ativa"],
                feedback: { short: "Boa priorização.", coach: "Deixe o cliente escolher a objeção." }
            },
            {
                label: "Podemos agendar e depois explico.", next: "C6AG", delta: 0, type: "Médio",
                skills: ["Compromisso"],
                feedback: { short: "Age, mas explica pouco.", coach: "Melhor tratar a objeção antes." }
            },
            {
                label: "Posso te avisar depois? Qual seu contato?", next: "C6CT", delta: 0, type: "Médio",
                skills: ["Retenção", "Comunicação"],
                feedback: { short: "Follow-up aberto.", coach: "Registre contato com resumo do valor." }
            }
        ]
    },

    C3P: {
        id: "C3P", title: "Foco precoce em preço", sprite: "suspicious",
        text: "Eu só queria saber valores.",
        hint: "Reenquadre preço após diagnóstico.",
        choices: [
            {
                label: "Faço um desconto especial!", next: "F_BAD", delta: -2, type: "Risco",
                skills: ["Reframe de valor"], feedback: { short: "Desconto sem contexto.", coach: "Evite barganha sem diagnóstico." }
            },
            {
                label: "Posso agendar e depois explico.", next: "C6AG", delta: 0, type: "Médio",
                skills: ["Compromisso"], feedback: { short: "Agendamento sem base.", coach: "Explique valor do exame." }
            },
            {
                label: "Primeiro entendemos sua visão no exame. Aí o preço faz sentido.",
                next: "C4", delta: +1, type: "Recuperação",
                skills: ["Reframe de valor", "Didática"], feedback: { short: "Boa correção.", coach: "Diagnóstico → proposta." }
            }
        ]
    },

    C4: {
        id: "C4", title: "Direcionar exame", sprite: "neutral",
        text: "É rápido? É pago?",
        hint: "Convite sem atrito.",
        choices: [
            {
                label: "É local, rápido e sem custo. Vamos lá e tiramos todas as dúvidas.",
                next: "C5H", delta: +1, type: "Ideal",
                skills: ["Convite claro", "Redução de fricção"],
                feedback: { short: "Convite objetivo.", coach: "Reforce 10–15min e sem fila." }
            },
            {
                label: "Se preferir, já deixo um horário agendado.",
                next: "C6AG", delta: +1, type: "Bom",
                skills: ["Compromisso", "Organização"],
                feedback: { short: "Boa alternativa.", coach: "Agenda mantém no funil." }
            },
            {
                label: "Se quiser, volta outro dia…",
                next: "F_BAD", delta: -3, type: "Risco",
                skills: ["Fechamento"], feedback: { short: "Perde urgência.", coach: "Convide agora ou agende próximo." }
            }
        ]
    },

    C5H: {
        id: "C5H", title: "Hub de objeções", sprite: "doubt",
        text: "…Tenho algumas dúvidas ainda.",
        hint: "Escolha a objeção relatada.",
        choices: [
            { label: "Sem tempo agora", next: "C5T", delta: 0, type: "Médio", skills: ["Gestão de tempo"], feedback: { short: "Trate o tempo.", coach: "Mostre baixo esforço." } },
            { label: "Não quero gastar hoje", next: "C5$", delta: 0, type: "Médio", skills: ["Separação custo/valor"], feedback: { short: "Separe custo de valor.", coach: "Exame gratuito." } },
            { label: "Tenho receio / Não confio", next: "C5F", delta: 0, type: "Médio", skills: ["Prova social"], feedback: { short: "Mostre evidência.", coach: "Apresente profissional e pré-teste." } }
        ]
    },

    C5T: {
        id: "C5T", title: "Objeção: tempo", sprite: "doubt",
        text: "Agora estou sem tempo.",
        hint: "Mostre baixo esforço e alternativas.",
        choices: [
            {
                label: "Consigo agendar um horário próximo.", next: "C6AG", delta: +1, type: "Bom",
                skills: ["Gestão de tempo", "Organização"], feedback: { short: "Boa alternativa.", coach: "Ofereça janelas próximas." }
            },
            {
                label: "Leva 10–15min, sem fila. Vamos agora?", next: "C4R", delta: +2, type: "Ideal",
                skills: ["Gestão de tempo", "Flexibilidade"], feedback: { short: "Ótima redução de fricção.", coach: "Convide para agora." }
            },
            {
                label: "A gente resolve sem exame; escolhe uma armação.", next: "F_BAD", delta: -2, type: "Risco",
                skills: ["Educação do cliente"], feedback: { short: "Atalho perigoso.", coach: "Exame precede solução." }
            }
        ]
    },

    C5$: {
        id: "C5$", title: "Objeção: custo", sprite: "suspicious",
        text: "Não quero gastar hoje.",
        hint: "Separe exame (gratuito) de compra.",
        choices: [
            {
                label: "O exame é gratuito e sem obrigação. Ele te ajuda a decidir com segurança.",
                next: "C4R", delta: +2, type: "Ideal",
                skills: ["Separação custo/valor", "Transparência"], feedback: { short: "Excelente esclarecimento.", coach: "Exame não obriga compra." }
            },
            {
                label: "Esses modelos estão bem baratos!", next: "F_BAD", delta: -2, type: "Risco",
                skills: ["Reframe de valor"], feedback: { short: "Preço sem diagnóstico.", coach: "Evite desviar." }
            },
            {
                label: "Podemos agendar para você pensar.", next: "C6AG", delta: +1, type: "Bom",
                skills: ["Compromisso"], feedback: { short: "Mantém no funil.", coach: "Envie lembrete depois." }
            }
        ]
    },

    C5F: {
        id: "C5F", title: "Objeção: confiança", sprite: "doubt",
        text: "Quero ter certeza que é confiável.",
        hint: "Use prova social/demonstração.",
        choices: [
            {
                label: "A gente faz um preço baixo pra você confiar.", next: "F_MED", delta: 0, type: "Médio",
                skills: ["Prova social"], feedback: { short: "Fraco como prova.", coach: "Preço ≠ evidência." }
            },
            {
                label: "Vamos fazer um pré-teste e te apresento o profissional.", next: "C6PT", delta: +2, type: "Ideal",
                skills: ["Prova social", "Demonstração"], feedback: { short: "Excelente.", coach: "Demonstração reduz incerteza." }
            },
            {
                label: "Confia em mim, vai dar certo.", next: "F_BAD", delta: -2, type: "Risco",
                skills: ["Prova social"], feedback: { short: "Sem evidência.", coach: "Mostre fatos e pessoas." }
            }
        ]
    },

    C6PT: {
        id: "C6PT", title: "Pré-teste", sprite: "neutral",
        text: "Ah, legal ver na prática.",
        hint: "Converter evidência em aceite.",
        choices: [
            {
                label: "Bora ao exame agora?", next: "C4R", delta: +2, type: "Ideal",
                skills: ["Demonstração", "Fechamento"], feedback: { short: "Fechamento natural.", coach: "Convide após evidência." }
            },
            {
                label: "Preferir agendar para outro momento?", next: "C6AG", delta: +1, type: "Bom",
                skills: ["Compromisso"], feedback: { short: "Boa alternativa.", coach: "Confirme data/hora." }
            },
            {
                label: "Então é isso, depois você vê.", next: "F_MED", delta: 0, type: "Médio",
                skills: ["Retenção"], feedback: { short: "Perde momentum.", coach: "Evite esfriar o aceite." }
            }
        ]
    },

    C4R: {
        id: "C4R", title: "Reafirma convite", sprite: "neutral",
        text: "Ok, entendido.",
        hint: "Feche aceite imediato.",
        choices: [
            {
                label: "Perfeito, vamos agora então.", next: "F_GOOD_NOW", delta: +3, type: "Ideal",
                skills: ["Fechamento", "Convite claro"], feedback: { short: "Excelente!", coach: "Leve-o à clínica." }
            },
            {
                label: "Prefere agendar para hoje mais tarde?", next: "C6AG", delta: +1, type: "Bom",
                skills: ["Compromisso"], feedback: { short: "Mantém compromisso.", coach: "Envie lembrete." }
            },
            {
                label: "Depois você volta.", next: "F_MED", delta: 0, type: "Médio",
                skills: ["Retenção"], feedback: { short: "Arriscado.", coach: "Melhor agendar." }
            }
        ]
    },

    C6AG: {
        id: "C6AG", title: "Agendamento", sprite: "neutral",
        text: "Pode ser amanhã às 15h.",
        hint: "Confirme compromisso e próximos passos.",
        choices: [
            {
                label: "Confirmar e enviar lembrete.", next: "F_GOOD_SCH", delta: 0, type: "Bom",
                skills: ["Compromisso", "Organização"], feedback: { short: "Agendado.", coach: "Registre contato." }
            },
            {
                label: "Confirmar sem lembrete.", next: "F_GOOD_SCH", delta: 0, type: "Médio",
                skills: ["Organização"], feedback: { short: "Ok.", coach: "Lembrete ajuda presença." }
            },
            {
                label: "Deixar em aberto.", next: "F_MED", delta: 0, type: "Médio",
                skills: ["Retenção"], feedback: { short: "Risco de no-show.", coach: "Evite." }
            }
        ]
    },

    C6CT: {
        id: "C6CT", title: "Coleta de contato", sprite: "neutral",
        text: "Te passo meu WhatsApp.",
        hint: "Garanta follow-up útil.",
        choices: [
            {
                label: "Enviar resumo do valor do exame e horários.", next: "F_MED", delta: 0, type: "Médio",
                skills: ["Comunicação", "Retenção"], feedback: { short: "Ok.", coach: "Seja objetivo e útil." }
            },
            {
                label: "Aguardar o cliente chamar.", next: "F_BAD", delta: -1, type: "Risco",
                skills: ["Comunicação"], feedback: { short: "Passivo.", coach: "Lidere o próximo passo." }
            },
            {
                label: "Ligar com insistência.", next: "F_BAD", delta: -2, type: "Risco",
                skills: ["Comunicação"], feedback: { short: "Invasivo.", coach: "Respeite o tempo do cliente." }
            }
        ]
    },

    /* FINAIS */
    F_GOOD_NOW: { id: "F_GOOD_NOW", final: true, label: "Final Bom — Exame agora" },
    F_GOOD_SCH: { id: "F_GOOD_SCH", final: true, label: "Final Bom — Exame agendado" },
    F_MED: { id: "F_MED", final: true, label: "Final Médio — Contato/follow-up" },
    F_BAD: { id: "F_BAD", final: true, label: "Final Ruim — Perda" },
};

/* ---------- ESTADO ---------- */
const state = {
    current: "C1",
    score: 0,
    path: [],      // [{from,to,label,delta,type,skills,feedbackShort,feedbackCoach}]
    skillsSum: {}, // { skill: points }
};

/* ---------- ELEMENTOS ---------- */
let $bg, $sprite, $sceneText, $sceneHint, $sceneLabel, $scoreLabel, $choices, $result, $pathList, $skillsTableBody, $finalBadge, $finalScore, $btnRestart, $btnPlayAgain, $btnDownloadHTML, $btnDownloadCSV, $btnDownloadJSON, $recoList;

/* ---------- INIT SEGURO ---------- */
document.addEventListener("DOMContentLoaded", () => {
    // map elements
    $bg = $("#bg");
    $sprite = $("#sprite");
    $sceneText = $("#sceneText");
    $sceneHint = $("#sceneHint");
    $sceneLabel = $("#sceneLabel");
    $scoreLabel = $("#scoreLabel");
    $choices = [$("#opt1"), $("#opt2"), $("#opt3")];
    $result = $("#result");
    $pathList = $("#pathList");
    $skillsTableBody = $("#skillsTable tbody");
    $finalBadge = $("#finalBadge");
    $finalScore = $("#finalScore");
    $btnRestart = $("#btnRestart");
    $btnPlayAgain = $("#btnPlayAgain");
    $btnDownloadHTML = $("#btnDownloadHTML");
    $btnDownloadCSV = $("#btnDownloadCSV");
    $btnDownloadJSON = $("#btnDownloadJSON");
    $recoList = $("#recoList");
    $recom = $('#recom');
    $jogotela = $('#jogo-tela');
    $jogoresp = $('#jogo-resp');
    

    // eventos
    $btnRestart.addEventListener("click", restart);
    $btnPlayAgain.addEventListener("click", restart);
    $btnDownloadCSV.addEventListener("click", () => download("caminho_enigma.csv", toCSV(), "text/csv;charset=utf-8"));
    $btnDownloadJSON.addEventListener("click", () => {
        const report = buildJSONReport();
        download("relatorio_enigma.json", JSON.stringify(report, null, 2), "application/json");
    });
    $btnDownloadHTML.addEventListener("click", () => {
        const report = buildJSONReport();
        const html = `<!doctype html><meta charset="utf-8"><title>Relatório — Enigma Óptico</title><pre>${escapeHtml(JSON.stringify(report, null, 2))}</pre>`;
        download("relatorio_enigma.html", html, "text/html;charset=utf-8");
    });

    // inicia
    restore();
    $scoreLabel.textContent = `${state.score} pts`;
    render(state.current || "C1");
});

/* ---------- RENDER ---------- */
function setBackground() {
    // simples: usa sempre o day; você pode alternar por cena se quiser
    $bg.src = ASSETS.bgDay;
}
function setSprite(kind = "neutral") {
    const map = {
        neutral: ASSETS.spriteNeutral,
        smile: ASSETS.spriteSmile,
        doubt: ASSETS.spriteDoubt,
        suspicious: ASSETS.spriteSuspicious,
    };
    $sprite.src = map[kind] || ASSETS.spriteNeutral;
    $sprite.alt = "Cliente na loja";
}

function render(nodeId) {
    const node = STORY[nodeId];
    if (!node) return;

    // finais
    if (node.final) { showReport(node.label); return; }

    state.current = nodeId;

    // cena
    setBackground();
    setSprite(node.sprite || "neutral");
    $sprite.classList.remove("hidden");
    requestAnimationFrame(() => $sprite.classList.add("show"));

    // textos
    $sceneText.textContent = node.text || "";
    $sceneHint.textContent = node.hint || "";
    $sceneLabel.textContent = node.title ? `Cena — ${node.title}` : "Cena";

    // rotações de opções (A/B/C rotacionadas)
    const shuffled = shuffle(node.choices.map(c => ({ ...c })));
    $choices.forEach((btn, i) => {
        const c = shuffled[i];
        btn.disabled = false;
        btn.textContent = c.label;
        btn.onclick = () => choose(node, c);
    });

    // foco acessível
    $choices[0].focus();
}

function choose(node, choice) {
    // pontuação
    state.score += (choice.delta || 0);
    $scoreLabel.textContent = `${state.score} pts`;

    // soma por competência
    (choice.skills || []).forEach(sk => {
        state.skillsSum[sk] = (state.skillsSum[sk] || 0) + (choice.delta || 0);
    });

    // histórico do caminho
    state.path.push({
        from: node.id,
        to: choice.next,
        label: choice.label,
        delta: choice.delta || 0,
        type: choice.type || "",
        skills: choice.skills || [],
        feedbackShort: choice.feedback?.short || "",
        feedbackCoach: choice.feedback?.coach || "",
    });

    // microanimação
    const btn = document.activeElement;
    if (btn && btn.classList.contains("choice")) {
        btn.style.transform = "translateY(0) scale(.97)";
        setTimeout(() => (btn.style.transform = ""), 120);
    }

    persist();
    render(choice.next);
}

/* ---------- RELATÓRIO ---------- */
function finalLevel(score) {
    if (score >= 12) return "Excelente";
    if (score >= 7) return "Bom";
    return "Em desenvolvimento";
}

function showReport(finalLabel) {
    // esconde sprite para finais
    $recom.classList.remove("hidden");
    $jogotela.classList.add("hidden");
    $jogoresp.classList.add("hidden");


    $finalBadge.textContent = finalLabel;
    $finalScore.textContent = `Pontuação: ${state.score} • Nível: ${finalLevel(state.score)}`;

    // Caminho percorrido
    $pathList.innerHTML = "";
    state.path.forEach((step, i) => {
        const li = document.createElement("li");
        li.innerHTML = `
      <strong>${i + 1}. ${step.from} → ${step.to}</strong><br>
      Escolha: <em>${step.label}</em><br>
      Delta: <b>${step.delta >= 0 ? "+" : ""}${step.delta}</b> • Tipo: ${step.type}<br>
      <span class="small">Competências: ${step.skills.join(", ") || "—"}</span><br>
      <span class="small"><em>${step.feedbackShort}</em> — ${step.feedbackCoach}</span>
    `;
        $pathList.appendChild(li);
    });

    // Tabela de competências
    $skillsTableBody.innerHTML = "";
    Object.entries(state.skillsSum)
        .sort((a, b) => b[1] - a[1])
        .forEach(([sk, pts]) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `<td>${sk}</td><td>${pts}</td>`;
            $skillsTableBody.appendChild(tr);
        });

    // Recomendações simples (exemplo)
    const reco = [];
    if ((state.skillsSum["Tratamento de objeções"] || 0) <= 1)
        reco.push("Pratique levar o cliente ao Hub de Objeções antes do convite final.");
    if ((state.skillsSum["Reframe de valor"] || 0) <= 0)
        reco.push("Reforce o valor do exame antes de falar em preço.");
    if ((state.skillsSum["Convite claro"] || 0) <= 1)
        reco.push("Seja específico: exame local, gratuito e rápido (10–15min).");
    $recoList.innerHTML = reco.length
        ? reco.map(r => `<li>${r}</li>`).join("")
        : "<li>Ótimo! Continue praticando com casos diferentes.</li>";

    // mostra seção
    $("#result").classList.remove("hidden");
    document.scrollingElement.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}

/* ---------- PERSISTÊNCIA ---------- */
function persist() { try { localStorage.setItem("enigma-optico-v3", JSON.stringify(state)); } catch { } }
function restore() {
    try {
        const raw = localStorage.getItem("enigma-optico-v3");
        if (!raw) return;
        const saved = JSON.parse(raw);
        state.current = saved.current || "C1";
        state.score = saved.score || 0;
        state.path = saved.path || [];
        state.skillsSum = saved.skillsSum || {};
    } catch { }
}
function restart() {
    state.current = "C1";
    state.score = 0;
    state.path = [];
    state.skillsSum = {};
    $("#result").classList.add("hidden");
    $("#jogo-tela").classList.remove("hidden");
    $("#jogo-resp").classList.remove("hidden");

    $scoreLabel.textContent = "0 pts";
    render("C1");
    persist();
}

/* ---------- EXPORTS ---------- */
function buildJSONReport() {
    return {
        jogador: "Jogador(a)",
        data_hora: new Date().toISOString(),
        final_alcancado: $finalBadge.textContent,
        nivel_final: finalLevel(state.score),
        pontuacao_total: state.score,
        pontuacao_por_competencia: Object.entries(state.skillsSum).map(([competencia, pontos]) => ({
            competencia, peso: SKILL_WEIGHTS[competencia] ?? 1, pontos,
            score_ponderado: (SKILL_WEIGHTS[competencia] ?? 1) * pontos
        })),
        cenarios_percorridos: state.path.map(s => ({
            cena_id: s.from, proxima: s.to, escolha: s.label, delta_pontos: s.delta,
            tipo_escolha: s.type, competencias_relacionadas: s.skills,
            feedback_curto: s.feedbackShort, feedback_coach: s.feedbackCoach
        })),
        recomendacoes_priorizadas: $all("#recoList li").map(li => li.textContent),
    };
}
function toCSV() {
    const header = ["ordem", "from", "to", "delta", "tipo", "skills", "label", "feedback_curto", "feedback_coach"];
    const rows = state.path.map((s, i) => [
        i + 1, s.from, s.to, s.delta, s.type,
        (s.skills || []).join(";"),
        s.label ? s.label.replace(/"/g, '""') : "",
        s.feedbackShort ? s.feedbackShort.replace(/"/g, '""') : "",
        s.feedbackCoach ? s.feedbackCoach.replace(/"/g, '""') : ""
    ]);
    return [
        header.join(","),
        ...rows.map(r => r.map(v => `"${v}"`).join(","))
    ].join("\n");
}
