package io.github.gastos.app;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;

import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Lê as notificações que chegam no celular e, quando uma delas é de compra/Pix do banco,
 * mostra o aviso "Você gastou R$ 45,90 em Ifood — toque para anotar".
 * Tudo acontece no aparelho: nada é enviado para fora.
 */
public class BancoListener extends NotificationListenerService {
    static final String CANAL = "compras";
    private static final long REPETIDA_MS = 3 * 60 * 1000; // o banco às vezes manda a mesma notificação 2 vezes
    private static final Map<String, Long> recentes = new LinkedHashMap<>();

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        try {
            if (sbn == null || getPackageName().equals(sbn.getPackageName())) return;
            Notification n = sbn.getNotification();
            if (n == null || (n.flags & Notification.FLAG_GROUP_SUMMARY) != 0 || (n.flags & Notification.FLAG_ONGOING_EVENT) != 0) return;
            Bundle ex = n.extras;
            if (ex == null) return;
            String titulo = texto(ex.getCharSequence(Notification.EXTRA_TITLE));
            CharSequence grande = ex.getCharSequence(Notification.EXTRA_BIG_TEXT);
            String corpo = texto(grande != null ? grande : ex.getCharSequence(Notification.EXTRA_TEXT));
            CompraParser.Compra c = CompraParser.ler(sbn.getPackageName(), titulo, corpo);
            if (c == null || repetida(c)) return;
            avisar(this, c);
        } catch (Exception ignored) {
            // nunca derruba o serviço por causa de uma notificação estranha
        }
    }

    private static String texto(CharSequence cs) { return cs == null ? "" : cs.toString(); }

    private static synchronized boolean repetida(CompraParser.Compra c) {
        long agora = System.currentTimeMillis();
        for (Iterator<Map.Entry<String, Long>> it = recentes.entrySet().iterator(); it.hasNext(); ) {
            if (agora - it.next().getValue() > REPETIDA_MS) it.remove();
        }
        String chave = (c.entrada ? "+" : "-") + c.valor + "|" + c.onde;
        if (recentes.containsKey(chave)) return true;
        recentes.put(chave, agora);
        return false;
    }

    /** Mostra o aviso; tocar abre a janelinha do widget já com o texto preenchido. */
    static void avisar(Context ctx, CompraParser.Compra c) {
        NotificationManager nm = ctx.getSystemService(NotificationManager.class);
        if (nm == null) return;
        if (Build.VERSION.SDK_INT >= 33 && ctx.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) return;
        criarCanal(ctx);

        int id = (int) (System.currentTimeMillis() & 0x7fffffff);
        Intent i = new Intent(ctx, QuickActivity.class);
        i.putExtra(QuickActivity.EXTRA_TEXTO, c.textoParaAnotar());
        i.putExtra(QuickActivity.EXTRA_AVISO, id);
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        PendingIntent pi = PendingIntent.getActivity(ctx, id, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        Notification.Builder b = new Notification.Builder(ctx, CANAL)
            .setSmallIcon(R.drawable.ic_notif)
            .setContentTitle(c.titulo())
            .setContentText("Não esqueça de anotar 📝 Toque para lançar: “" + c.textoParaAnotar() + "”")
            .setStyle(new Notification.BigTextStyle().bigText("Não esqueça de anotar 📝\nToque para lançar no Gastos: “" + c.textoParaAnotar() + "”"))
            .setColor(ctx.getColor(R.color.acento))
            .setContentIntent(pi)
            .setAutoCancel(true)
            .addAction(new Notification.Action.Builder(null, "Anotar", pi).build());
        nm.notify(id, b.build());
    }

    static void criarCanal(Context ctx) {
        NotificationManager nm = ctx.getSystemService(NotificationManager.class);
        if (nm == null || nm.getNotificationChannel(CANAL) != null) return;
        NotificationChannel ch = new NotificationChannel(CANAL, "Compras para anotar", NotificationManager.IMPORTANCE_DEFAULT);
        ch.setDescription("Avisa quando o banco notifica uma compra ou Pix, para você não esquecer de anotar.");
        nm.createNotificationChannel(ch);
    }

    /** O usuário já deu o "Acesso às notificações" para o Gastos? */
    static boolean ativo(Context ctx) {
        String lista = Settings.Secure.getString(ctx.getContentResolver(), "enabled_notification_listeners");
        return lista != null && lista.contains(new ComponentName(ctx, BancoListener.class).flattenToString());
    }

    static boolean podeNotificar(Context ctx) {
        return Build.VERSION.SDK_INT < 33 || ctx.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
    }
}
