package io.github.gastos.app;

/** O app completo (mesmo site, dentro do app). */
public class MainActivity extends WebActivity {
    @Override
    protected String endereco() { return SITE; }

    @Override
    public void onBackPressed() {
        if (web != null && web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }
}
