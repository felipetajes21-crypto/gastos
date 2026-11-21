package io.github.gastos.app;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.ContentValues;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.MediaStore;
import android.speech.RecognizerIntent;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import org.json.JSONObject;

import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;

/**
 * Tela que mostra o site do Gastos dentro do app.
 * O app e a janelinha do widget usam o mesmo WebView "por baixo", então os dados são os mesmos.
 */
public abstract class WebActivity extends Activity {
    static final String SITE = "https://felipetajes21-crypto.github.io/gastos/";
    private static final int REQ_VOZ = 1;
    private static final int REQ_ARQUIVO = 2;

    protected WebView web;
    private ValueCallback<Uri[]> arquivoCallback;

    /** Endereço que esta tela abre. */
    protected abstract String endereco();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        web = new WebView(this);
        web.setBackgroundColor(getColor(R.color.fundo));
        setContentView(web);
        configurar(web);
        if (savedInstanceState == null || web.restoreState(savedInstanceState) == null) {
            web.loadUrl(endereco());
        }
    }

    private void configurar(WebView w) {
        WebSettings s = w.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        w.setOverScrollMode(View.OVER_SCROLL_NEVER);
        w.addJavascriptInterface(new Ponte(), "Android");

        w.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                Uri u = req.getUrl();
                if (u.toString().startsWith(SITE)) return false; // fica no app
                // links de fora (ex.: baixar o app, sites de bancos) abrem no navegador
                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception ignored) { }
                return true;
            }
        });

        w.setWebChromeClient(new WebChromeClient() {
            // "Restaurar backup" / "Importar CSV": abre o seletor de arquivos do celular
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> cb, FileChooserParams params) {
                if (arquivoCallback != null) arquivoCallback.onReceiveValue(null);
                arquivoCallback = cb;
                Intent i = new Intent(Intent.ACTION_GET_CONTENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType("*/*");
                try {
                    startActivityForResult(Intent.createChooser(i, "Escolha o arquivo"), REQ_ARQUIVO);
                } catch (ActivityNotFoundException e) {
                    arquivoCallback = null;
                    return false;
                }
                return true;
            }
        });
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
        // o widget pode ter salvo algo enquanto esta tela estava em segundo plano
        web.evaluateJavascript("window.recarregarDados && window.recarregarDados()", null);
    }

    @Override
    protected void onPause() {
        web.onPause();
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        if (web != null) {
            web.removeJavascriptInterface("Android");
            web.destroy();
        }
        super.onDestroy();
    }

    @Override
    protected void onActivityResult(int req, int res, Intent data) {
        super.onActivityResult(req, res, data);
        if (req == REQ_VOZ) {
            String texto = null;
            if (res == RESULT_OK && data != null) {
                ArrayList<String> r = data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
                if (r != null && !r.isEmpty()) texto = r.get(0);
            }
            web.evaluateJavascript("window.vozNativa && window.vozNativa(" + (texto == null ? "null" : JSONObject.quote(texto)) + ")", null);
        } else if (req == REQ_ARQUIVO && arquivoCallback != null) {
            arquivoCallback.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(res, data));
            arquivoCallback = null;
        }
    }

    /** Abre o reconhecimento de voz do Google (o mesmo do teclado). */
    void ouvir() {
        Intent i = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        i.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        i.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "pt-BR");
        i.putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, "pt-BR");
        i.putExtra(RecognizerIntent.EXTRA_PROMPT, "Fale o gasto (ex.: 12 reais vôlei, 40 reais mercado)");
        i.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1);
        try {
            startActivityForResult(i, REQ_VOZ);
        } catch (ActivityNotFoundException e) {
            Toast.makeText(this, "Reconhecimento de voz indisponível. Instale/atualize o app Google.", Toast.LENGTH_LONG).show();
            web.evaluateJavascript("window.vozNativa && window.vozNativa(null)", null);
        }
    }

    /** Salva o backup/CSV na pasta Downloads. Devolve "" se deu certo ou a mensagem de erro. */
    String salvarArquivo(String nome, String conteudo, String tipo) {
        try {
            byte[] bytes = conteudo.getBytes(StandardCharsets.UTF_8);
            if (Build.VERSION.SDK_INT >= 29) {
                ContentValues v = new ContentValues();
                v.put(MediaStore.Downloads.DISPLAY_NAME, nome);
                v.put(MediaStore.Downloads.MIME_TYPE, tipo == null || tipo.isEmpty() ? "application/octet-stream" : tipo);
                Uri uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
                if (uri == null) return "Não consegui salvar o arquivo";
                try (OutputStream os = getContentResolver().openOutputStream(uri)) {
                    if (os == null) return "Não consegui salvar o arquivo";
                    os.write(bytes);
                }
                return "";
            }
            // Android 8–9: manda pelo "Compartilhar" (Drive, e-mail, WhatsApp…)
            Intent i = new Intent(Intent.ACTION_SEND);
            i.setType("text/plain");
            i.putExtra(Intent.EXTRA_SUBJECT, nome);
            i.putExtra(Intent.EXTRA_TEXT, conteudo);
            startActivity(Intent.createChooser(i, "Salvar " + nome));
            return "Escolha onde guardar o arquivo";
        } catch (Exception e) {
            return "Não consegui salvar: " + e.getMessage();
        }
    }

    /** O que o site pode chamar (window.Android.xxx). */
    class Ponte {
        @JavascriptInterface
        public void ouvir() { runOnUiThread(WebActivity.this::ouvir); }

        @JavascriptInterface
        public void fechar() { runOnUiThread(WebActivity.this::fecharRapido); }

        @JavascriptInterface
        public void abrirApp() {
            runOnUiThread(() -> {
                Intent i = new Intent(WebActivity.this, MainActivity.class);
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(i);
                fecharRapido();
            });
        }

        @JavascriptInterface
        public void atualizarWidget(String json) {
            GastosWidget.salvarResumo(getApplicationContext(), json);
        }

        @JavascriptInterface
        public String salvarArquivo(String nome, String conteudo, String tipo) {
            return WebActivity.this.salvarArquivo(nome, conteudo, tipo);
        }
    }

    /** Só a janelinha do widget fecha; o app principal ignora. */
    protected void fecharRapido() { }
}
