<%@ Page Language="C#" %>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Beispielseite mit Chatbot</title>
</head>
<body>
    <h1>Ihre bestehende ASPX-Seite</h1>
    <p>Der Chatbot erscheint unten rechts.</p>

    <!-- Chatbot Widget - das ist alles was Sie brauchen -->
    <script src="chatbot-widget.js"
            data-api-url="http://localhost:8080"
            data-auto-init="true">
    </script>
</body>
</html>
