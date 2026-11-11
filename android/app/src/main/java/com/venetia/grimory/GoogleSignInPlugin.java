package com.venetia.grimory;

import android.os.CancellationSignal;
import android.util.Log;

import androidx.core.content.ContextCompat;
import androidx.credentials.ClearCredentialStateRequest;
import androidx.credentials.Credential;
import androidx.credentials.CredentialManager;
import androidx.credentials.CredentialManagerCallback;
import androidx.credentials.CustomCredential;
import androidx.credentials.GetCredentialRequest;
import androidx.credentials.GetCredentialResponse;
import androidx.credentials.exceptions.ClearCredentialException;
import androidx.credentials.exceptions.GetCredentialCancellationException;
import androidx.credentials.exceptions.GetCredentialException;
import androidx.credentials.exceptions.NoCredentialException;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.libraries.identity.googleid.GetSignInWithGoogleOption;
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential;

/**
 * Login com Google no app. O Google bloqueia o OAuth dentro de uma WebView, então
 * a conta é escolhida aqui, pelo Credential Manager do Android, e o JS recebe só
 * o ID token do Google — com ele o Firebase JS entra (`signInWithCredential`),
 * igual ao site. Não usa o SDK Android do Firebase nem `google-services.json`.
 *
 * `serverClientId` é o "Web client ID" do provedor Google no Firebase. O Google
 * confere o pacote e o SHA-1 da assinatura deste APK contra um app Android
 * cadastrado no mesmo projeto: sem ele o login falha com "Developer console is
 * not set up correctly".
 */
@CapacitorPlugin(name = "GoogleSignIn")
public class GoogleSignInPlugin extends Plugin {

    private static final String TAG = "GoogleSignIn";

    /**
     * O Credential Manager devolve `GetCredentialCancellationException` também quando o
     * Google recusa o app depois da escolha da conta — o caso típico é o SHA-1 da
     * assinatura deste APK não cadastrado no app Android do Firebase. A mensagem é
     * "[16] Account reauth failed."; um cancelamento de verdade não traz o código 16.
     */
    private static boolean isConfigFailure(GetCredentialException e) {
        String message = e.getMessage();
        if (message == null) return false;
        String lower = message.toLowerCase(java.util.Locale.ROOT);
        return lower.contains("[16]") || lower.contains("reauth");
    }

    @PluginMethod
    public void signIn(PluginCall call) {
        String serverClientId = call.getString("serverClientId");
        if (serverClientId == null || serverClientId.isEmpty()) {
            call.reject("serverClientId ausente", "invalid");
            return;
        }

        // O fluxo do botão "Entrar com Google": sempre mostra o seletor de contas.
        GetSignInWithGoogleOption option = new GetSignInWithGoogleOption.Builder(serverClientId).build();
        GetCredentialRequest request = new GetCredentialRequest.Builder().addCredentialOption(option).build();

        CredentialManager.create(getContext()).getCredentialAsync(
            getActivity(),
            request,
            new CancellationSignal(),
            ContextCompat.getMainExecutor(getContext()),
            new CredentialManagerCallback<GetCredentialResponse, GetCredentialException>() {
                @Override
                public void onResult(GetCredentialResponse result) {
                    Credential credential = result.getCredential();
                    String type = credential.getType();
                    boolean google = GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL.equals(type)
                        || GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_SIWG_CREDENTIAL.equals(type);
                    if (!(credential instanceof CustomCredential) || !google) {
                        call.reject("credencial inesperada: " + type, "failed");
                        return;
                    }
                    try {
                        GoogleIdTokenCredential token = GoogleIdTokenCredential.createFrom(credential.getData());
                        JSObject ret = new JSObject();
                        ret.put("idToken", token.getIdToken());
                        call.resolve(ret);
                    } catch (Exception e) {
                        call.reject("credencial do Google ilegível", "failed", e);
                    }
                }

                @Override
                public void onError(GetCredentialException e) {
                    Log.w(TAG, "Login com Google falhou: " + e.getType() + ": " + e.getMessage(), e);
                    if (e instanceof GetCredentialCancellationException && isConfigFailure(e)) {
                        // Chega como "cancelamento", mas a pessoa escolheu a conta: o Google
                        // recusou o pacote/SHA-1 deste APK ("[16] Account reauth failed").
                        call.reject(e.getMessage(), "config", e);
                    } else if (e instanceof GetCredentialCancellationException) {
                        call.reject("cancelado", "cancelled");
                    } else if (e instanceof NoCredentialException) {
                        call.reject("nenhuma conta Google no aparelho", "no_credential");
                    } else {
                        call.reject(e.getType() + ": " + e.getMessage(), "failed", e);
                    }
                }
            }
        );
    }

    /** Esquece a conta escolhida: o próximo login mostra o seletor de novo. */
    @PluginMethod
    public void signOut(PluginCall call) {
        CredentialManager.create(getContext()).clearCredentialStateAsync(
            new ClearCredentialStateRequest(),
            new CancellationSignal(),
            ContextCompat.getMainExecutor(getContext()),
            new CredentialManagerCallback<Void, ClearCredentialException>() {
                @Override
                public void onResult(Void result) {
                    call.resolve();
                }

                @Override
                public void onError(ClearCredentialException e) {
                    call.reject(e.getMessage(), "failed", e);
                }
            }
        );
    }
}
