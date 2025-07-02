<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// PHPMailer Lib:
require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Retrieve and sanitize form data
    $name    = isset($_POST['Full-name']) ? strip_tags(trim($_POST['Full-name'])) : '';
    $email   = isset($_POST['Contact-email']) ? filter_var(trim($_POST['Contact-email']), FILTER_SANITIZE_EMAIL) : '';
    $message = isset($_POST['More-info']) ? strip_tags(trim($_POST['More-info'])) : '';

    // Validate required fields
    if (empty($name) || empty($email) || empty($message) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo "Invalid input. Please fill in all fields correctly.";
        exit;
    }

    // Subject for the email
    $subject = "New Website Form Submission";

    // HTML content
    // You can tweak colors, margins, and font sizes as desired
    $htmlBody = "
    <html>
      <head>
        <style>
          body {
            background-color: #f8f8f8;
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            font-size: 16px;
            color: #333;
          }
          .email-wrapper {
            max-width: 600px;
            margin: 40px auto;
            background: #fff;
            border-radius: 6px;
            border: 1px solid #ddd;
            padding: 30px;
          }
          .logo-wrapper {
            text-align: center;
            margin-bottom: 20px;
          }
          .logo-wrapper img {
            max-width: 150px;
            height: auto;
          }
          h1 {
            text-align: center;
            color: #146173; /* Updated header color */
            margin-bottom: 1.5em;
            font-size: 24px;
          }
          p {
            line-height: 1.6;
            margin: 1em 0;
          }
          .indent {
            margin-left: 20px; /* Indent the message */
            font-weight: bold; /* Make the message bold */
          }
          .footer {
            margin-top: 2em;
            text-align: center;
            font-size: 14px;
            color: #999;
          }
        </style>
      </head>
      <body>
        <div class='email-wrapper'>
          <div class='logo-wrapper'>
            <img src='https://stewardwellcapital.com/images/StewardWell%20Capital%20Logo.png' alt='StewardWell Capital Logo'>
          </div>
          <h1>New Website Form Submission</h1>
          <p>Hello,</p>
          <p>
            We have received a new submission on the website from <strong>$name</strong>. 
            Their email address is <strong>$email</strong>. Kindly view their submitted message or inquiry below.
          </p>
          <p class='indent'><strong>$message</strong></p>
          <p>Kindly acknowledge receipt and respond to the prospect.</p>
          <div class='footer'>
            You are receiving this email because a visitor submitted an inquiry through your website.
          </div>
        </div>
      </body>
    </html>
    ";

    // Plain-text fallback (for non-HTML mail clients)
    $plainBody = "Hello,

We have received a new submission on the website from $name.
Their email address is $email. Kindly view their submitted message or inquiry below.

\"$message\"

Kindly acknowledge receipt and respond to the prospect.

Best Regards,
StewardWell Capital.

You are receiving this email because a visitor submitted an inquiry through your website.
";

    // Create a new PHPMailer instance
    $mail = new PHPMailer(true);

    try {
        // SMTP server settings
        $mail->isSMTP();
        $mail->Host       = 'smtppro.zohocloud.ca';         // Zoho SMTP host
        $mail->SMTPAuth   = true;
        $mail->Username   = 'info@stewardwellcapital.com';  // SMTP username
        $mail->Password   = 'Alasepeibadan01@';             // SMTP password
        $mail->SMTPSecure = 'ssl';                          // Encryption
        $mail->Port       = 465;                            // Port for SSL

        // Recipients
        $mail->setFrom('info@stewardwellcapital.com', 'StewardWell Capital');
        $mail->addAddress('info@stewardwellcapital.com'); // Where you want to receive the form data
        $mail->addReplyTo($email, $name);

        // Content
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body    = $htmlBody;
        $mail->AltBody = $plainBody; // Fallback for non-HTML email clients

        // Send
        $mail->send();
        echo "Thank you! Your message has been sent.";
    } catch (Exception $e) {
        echo "Oops! Something went wrong and we couldn't send your message. Error: {$mail->ErrorInfo}";
    }
} else {
    echo "There was a problem with your submission, please try again.";
}
?>
