package app.witchyledger.offline;
import android.app.Activity;
import android.os.Bundle;
import android.webkit.*;
import android.net.Uri;
import android.content.Intent;
import android.view.WindowInsets;
import android.widget.Toast;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.Collections;

public class MainActivity extends Activity {
 private WebView web; private ValueCallback<Uri[]> upload; private String pendingExport;
 @Override public void onCreate(Bundle state){super.onCreate(state);web=new WebView(this);android.widget.FrameLayout frame=new android.widget.FrameLayout(this);frame.addView(web,new android.widget.FrameLayout.LayoutParams(-1,-1));setContentView(frame);frame.setOnApplyWindowInsetsListener((v,i)->{android.graphics.Insets bars=i.getInsets(WindowInsets.Type.systemBars()|WindowInsets.Type.ime());v.setPadding(bars.left,bars.top,bars.right,bars.bottom);return i;});
 WebSettings settings=web.getSettings();settings.setJavaScriptEnabled(true);settings.setDomStorageEnabled(true);settings.setAllowFileAccess(false);settings.setAllowContentAccess(true);settings.setMediaPlaybackRequiresUserGesture(true);settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);web.addJavascriptInterface(new ExportBridge(),"WitchyNative");
 web.setWebViewClient(new WebViewClient(){@Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest req){return !"appassets.androidplatform.net".equals(req.getUrl().getHost());}@Override public WebResourceResponse shouldInterceptRequest(WebView view,WebResourceRequest req){Uri u=req.getUrl();if(!"https".equals(u.getScheme())||!"appassets.androidplatform.net".equals(u.getHost()))return error();try{String file=u.getPath();if(file==null||file.equals("/"))file="/index.html";if(file.contains(".."))return error();String ext=file.substring(file.lastIndexOf('.')+1);String mime=ext.equals("js")?"application/javascript":ext.equals("css")?"text/css":ext.equals("html")?"text/html":ext.equals("svg")?"image/svg+xml":ext.equals("png")?"image/png":ext.equals("woff2")?"font/woff2":ext.equals("woff")?"font/woff":"application/octet-stream";return new WebResourceResponse(mime,"UTF-8",200,"OK",Collections.singletonMap("Cache-Control","no-store"),getAssets().open("www"+file));}catch(Exception e){return error();}}});
 web.setWebChromeClient(new WebChromeClient(){@Override public boolean onShowFileChooser(WebView view,ValueCallback<Uri[]> callback,FileChooserParams params){if(upload!=null)upload.onReceiveValue(null);upload=callback;Intent choose=new Intent(Intent.ACTION_OPEN_DOCUMENT);choose.setType("application/json");choose.addCategory(Intent.CATEGORY_OPENABLE);try{startActivityForResult(choose,101);}catch(Exception e){upload.onReceiveValue(null);upload=null;}return true;}});
 web.loadUrl("https://appassets.androidplatform.net/");}
 private WebResourceResponse error(){return new WebResourceResponse("text/plain","UTF-8",403,"Blocked",Collections.emptyMap(),new ByteArrayInputStream(new byte[0]));}
 public class ExportBridge {@JavascriptInterface public void exportFile(String name,String content,String mime){if(content.length()>25000000)return;runOnUiThread(()->{if(pendingExport!=null){Toast.makeText(MainActivity.this,"Please finish the previous export",Toast.LENGTH_SHORT).show();return;}pendingExport=content;Intent save=new Intent(Intent.ACTION_CREATE_DOCUMENT);save.addCategory(Intent.CATEGORY_OPENABLE);save.setType(mime.startsWith("text/csv")?"text/csv":"application/json");save.putExtra(Intent.EXTRA_TITLE,name.replaceAll("[^a-zA-Z0-9._-]","_"));try{startActivityForResult(save,102);}catch(Exception e){pendingExport=null;}});}}
 @Override protected void onActivityResult(int request,int result,Intent data){super.onActivityResult(request,result,data);if(request==101&&upload!=null){upload.onReceiveValue(result==RESULT_OK&&data!=null?new Uri[]{data.getData()}:null);upload=null;}if(request==102){if(result==RESULT_OK&&data!=null&&pendingExport!=null){try(OutputStream out=getContentResolver().openOutputStream(data.getData())){out.write(pendingExport.getBytes(StandardCharsets.UTF_8));Toast.makeText(this,"Backup saved",Toast.LENGTH_SHORT).show();}catch(Exception e){Toast.makeText(this,"Cannot save backup",Toast.LENGTH_LONG).show();}}pendingExport=null;}}
 @Override public void onBackPressed(){if(web.canGoBack())web.goBack();else super.onBackPressed();}
 @Override protected void onDestroy(){web.removeJavascriptInterface("WitchyNative");web.destroy();super.onDestroy();}
}
