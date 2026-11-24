package io.github.gastos.app;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Lê o texto de uma notificação de banco e descobre se é uma compra/Pix enviado (gasto)
 * ou um Pix/transferência recebido (entrada). Java puro, para dar para testar fora do Android.
 */
final class CompraParser {

    /** O que foi encontrado na notificação. */
    static final class Compra {
        final boolean entrada;
        final String valor;   // "45,90"
        final String onde;    // "Ifood" (pode ser null)
        final String metodo;  // "pix", "crédito", "débito" ou ""

        Compra(boolean entrada, String valor, String onde, String metodo) {
            this.entrada = entrada;
            this.valor = valor;
            this.onde = onde;
            this.metodo = metodo;
        }

        /** Texto que vai para a caixa do app, no formato que o leitor do app entende. */
        String textoParaAnotar() {
            String v = valor.replaceAll("\\.(?=\\d{3})", "");
            if (entrada) {
                return ("recebi " + v + ("pix".equals(metodo) ? " pix" : "") + (onde != null ? " de " + onde.toLowerCase(Locale.ROOT) : "")).trim();
            }
            return ((onde != null ? onde.toLowerCase(Locale.ROOT) : "compra") + " " + v + (metodo.isEmpty() ? "" : " " + metodo)).trim();
        }

        /** Título do aviso: "Você gastou R$ 45,90 no Ifood". */
        String titulo() {
            boolean pix = "pix".equals(metodo);
            String base = entrada ? "Você recebeu R$ " + valor : pix ? "Você enviou um Pix de R$ " + valor : "Você gastou R$ " + valor;
            if (onde == null) return base;
            return base + (entrada ? " de " : pix ? " para " : " em ") + onde;
        }
    }

    // apps de conversa/rede social: texto de outras pessoas, nunca é aviso do banco
    private static final String[] APPS_IGNORADOS = {
        "com.whatsapp", "com.whatsapp.w4b", "org.telegram.messenger", "com.instagram.android",
        "com.facebook.orca", "com.facebook.katana", "com.discord", "com.twitter.android", "com.zhiliaoapp.musically",
        "com.google.android.gm", "com.microsoft.office.outlook", "com.samsung.android.email.provider",
    };

    private static final Pattern VALOR = Pattern.compile("R\\$\\s*(\\d{1,3}(?:\\.\\d{3})*,\\d{2}|\\d+,\\d{2})", Pattern.CASE_INSENSITIVE);

    // (texto já sem acento e em minúsculas)
    private static final Pattern GASTO = Pattern.compile(
        "compra (aprovada|realizada|efetuada|autorizada|no (cartao|credito|debito))|(fez|realizou|efetuou) uma compra|nova compra"
        + "|compra de r\\$|compra no valor|pagamento (realizado|efetuado|aprovado|confirmado|feito)|voce pagou|pagou r\\$"
        + "|pix (enviado|realizado|efetuado|feito)|voce (fez|enviou|mandou) um pix|transferencia (enviada|realizada|efetuada)"
        + "|voce (enviou|transferiu)|debito (realizado|efetuado|automatico)|saque (realizado|efetuado)");
    private static final Pattern ENTRADA = Pattern.compile(
        "(pix|transferencia|ted|doc|deposito) recebid[oa]|voce recebeu|recebeu (um )?(pix|transferencia|r\\$)|caiu (um )?pix|chegou (um )?pix|chegou dinheiro");
    private static final Pattern IGNORAR = Pattern.compile(
        "estorn|cancelad|negad|recusad|nao autorizad|nao aprovad|bloquead|sua fatura|fatura (fechou|fechada|vence|disponivel)|vencimento|lembrete|agendad|agendamento"
        + "|oferta|promoc|cupom|emprestimo|codigo de (verificacao|seguranca|acesso)|token|senha|tentativa");

    private static final Pattern ONDE_GASTO = Pattern.compile(
        "(?i)(?:\\bem|\\bno|\\bna|\\bpara|\\bpra|\\bp/|estabelecimento:?|loja:?)\\s+([^.,;:!\\n()]{2,45})");
    private static final Pattern ONDE_ENTRADA = Pattern.compile(
        "(?i)(?:\\bde|\\bdo|\\bda|\\bremetente:?)\\s+([^.,;:!\\n()]{2,45})");
    // onde o nome acaba ("IFOOD foi aprovada", "MERCADO no valor de"…)
    private static final Pattern FIM_NOME = Pattern.compile(
        "(?i)\\s+(?:foi|para o cart|para a conta|no cart|no credito|no debito|no valor|valor|com (?:o|seu|sua|cart)|via|aprovad\\w*|realizad\\w*|efetuad\\w*|autorizad\\w*|as \\d|às|em \\d|no dia|dia \\d|r\\$|final|pelo|pela|usando|hoje|ontem).*$");
    // palavras que vêm depois de "no/em/para" mas não são o lugar
    private static final Pattern NAO_E_LUGAR = Pattern.compile(
        "^(cartao|credito|debito|conta|valor|r\\$|seu|sua|app|aplicativo|banco|pix|dia|hoje|ontem|\\d)");

    // SMS no formato "R$ 87,90, MERCADO EXTRA, 21/11": o nome vem logo depois do valor
    private static final Pattern NOME_APOS_VALOR = Pattern.compile("R\\$\\s*[\\d.]+,\\d{2}\\s*[,-]\\s*([A-Z][A-Z0-9 *&'.-]{2,40})");

    private CompraParser() { }

    static String semAcento(String s) {
        return Normalizer.normalize(s == null ? "" : s, Normalizer.Form.NFD).replaceAll("\\p{M}", "").toLowerCase(Locale.ROOT);
    }

    /** Devolve a compra encontrada ou null se a notificação não for de compra/Pix. */
    static Compra ler(String pacote, String titulo, String texto) {
        if (pacote != null) for (String p : APPS_IGNORADOS) if (p.equals(pacote)) return null;
        String tudo = ((titulo == null ? "" : titulo) + ". " + (texto == null ? "" : texto)).trim();
        String n = semAcento(tudo).replaceAll("\\s+", " ");
        if (IGNORAR.matcher(n).find()) return null;

        Matcher mv = VALOR.matcher(tudo);
        if (!mv.find()) return null;
        String valor = mv.group(1);

        boolean entrada = ENTRADA.matcher(n).find();
        boolean gasto = !entrada && GASTO.matcher(n).find();
        if (!entrada && !gasto) return null;

        String metodo = n.contains("pix") ? "pix" : n.contains("debito") ? "débito" : (n.contains("credito") || n.contains("cartao")) ? "crédito" : "";
        String onde = acharOnde(texto == null ? tudo : texto, entrada);
        if (onde == null && titulo != null) onde = acharOnde(titulo, entrada);
        if (onde == null) {
            Matcher mn = NOME_APOS_VALOR.matcher(tudo);
            if (mn.find()) onde = limpar(FIM_NOME.matcher(mn.group(1).trim()).replaceAll("").trim());
        }
        return new Compra(entrada, valor, onde, metodo);
    }

    private static String acharOnde(String texto, boolean entrada) {
        Matcher m = (entrada ? ONDE_ENTRADA : ONDE_GASTO).matcher(texto);
        int pos = 0;
        // "no crédito em LOJA": o primeiro trecho não é o lugar, então procura de novo logo depois do "no"
        while (pos < texto.length() && m.find(pos)) {
            pos = m.start(1);
            String c = FIM_NOME.matcher(m.group(1).trim()).replaceAll("").trim();
            if (c.length() < 2) continue;
            String cn = semAcento(c);
            if (NAO_E_LUGAR.matcher(cn).find()) continue;
            return limpar(c);
        }
        return null;
    }

    /** "IFOOD *RESTAURANTE XYZ" → "Ifood"; "PADARIA DO ZE LTDA" → "Padaria Do Ze". */
    private static String limpar(String s) {
        String[] partes = s.split("\\*");
        String p = partes[0].trim().isEmpty() && partes.length > 1 ? partes[1] : partes[0];
        p = p.replaceAll("(?i)\\b(ltda|me|eireli|s/?a)\\b\\.?", "").replaceAll("[^\\p{L}\\p{N}&' -]", " ").replaceAll("\\s+", " ").trim();
        String[] palavras = p.split(" ");
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < palavras.length && i < 3; i++) {
            String w = palavras[i];
            if (w.isEmpty()) continue;
            if (out.length() > 0) out.append(' ');
            out.append(w.substring(0, 1).toUpperCase(Locale.ROOT)).append(w.substring(1).toLowerCase(Locale.ROOT));
        }
        return out.length() == 0 ? null : out.toString();
    }
}
