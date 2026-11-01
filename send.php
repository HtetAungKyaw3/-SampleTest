<!-- <?php
/**
 * send.php
 * 修繕羅針盤 - フォーム送信処理
 * Local MAMP Environment (Development)
 */

// ========================================
// 設定（★ Local MAMP အတွက်）
// ========================================
$DB_HOST = 'localhost';
$DB_NAME = 'repair_compass';
$DB_USER = 'root';
$DB_PASS = 'root';
$DB_PORT = '8889';

$UPLOAD_DIR = __DIR__ . '/upload/';

$MAIL_TO   = 'info@shuzenrashinban.jp';
$MAIL_FROM = 'noreply@shuzenrashinban.jp';

// ========================================
// 入力取得
// ========================================
$contact_type = $_POST['contact_type'] ?? '';
$name         = trim($_POST['name']        ?? '');
$furigana     = trim($_POST['furigana']    ?? '');
$mail         = trim($_POST['mail']        ?? '');
$phonenumber  = trim($_POST['phonenumber'] ?? '');
$region       = trim($_POST['region']      ?? '');
$scale        = trim($_POST['scale']       ?? '');
$message      = trim($_POST['message']     ?? '');

// ========================================
// バリデーション
// ========================================
$errors = [];
if (!in_array($contact_type, ['consult','document'], true)) $errors[] = 'お問い合わせの種類が不正です。';
if ($name === '')      $errors[] = 'お名前は必須です。';
if ($furigana === '')  $errors[] = 'ふりがなは必須です。';
if ($mail === '' || !filter_var($mail, FILTER_VALIDATE_EMAIL)) $errors[] = 'メールアドレスが不正です。';
if ($region === '')    $errors[] = 'お住まいの地域は必須です。';

if ($errors) {
    http_response_code(400);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'message' => implode(' ', $errors)]);
    exit;
}

// ========================================
// 添付ファイル保存
// ========================================
$savedFiles = [];
$allowedExt = ['pdf','jpg','jpeg','png','xlsx','docx'];
$maxSize    = 10 * 1024 * 1024;

if (!empty($_FILES['attachments']['name'][0])) {
    $subDir = date('Y/m') . '/';
    $absDir = $UPLOAD_DIR . $subDir;

    if (!is_dir($absDir)) {
        @mkdir($absDir, 0707, true);
    }

    $count = count($_FILES['attachments']['name']);
    for ($i = 0; $i < $count; $i++) {
        if ($_FILES['attachments']['error'][$i] !== UPLOAD_ERR_OK) continue;

        $origName = $_FILES['attachments']['name'][$i];
        $tmpPath  = $_FILES['attachments']['tmp_name'][$i];
        $size     = $_FILES['attachments']['size'][$i];
        $ext      = strtolower(pathinfo($origName, PATHINFO_EXTENSION));

        if (!in_array($ext, $allowedExt, true)) continue;
        if ($size > $maxSize) continue;

        $newName = date('YmdHis') . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
        $target  = $absDir . $newName;

        if (move_uploaded_file($tmpPath, $target)) {
            @chmod($target, 0604);
            $savedFiles[] = $subDir . $newName;
        }
    }
}

$filePathJoined = implode(',', $savedFiles);

// ========================================
// DB保存
// ========================================
try {
    $pdo = new PDO(
        "mysql:host=$DB_HOST;port=$DB_PORT;dbname=$DB_NAME;charset=utf8mb4",
        $DB_USER,
        $DB_PASS,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]
    );

    $sql = "INSERT INTO contacts
            (contact_type, name, furigana, mail, phonenumber, region, scale, message, file_path)
            VALUES (:contact_type, :name, :furigana, :mail, :phonenumber, :region, :scale, :message, :file_path)";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':contact_type' => $contact_type,
        ':name'         => $name,
        ':furigana'     => $furigana,
        ':mail'         => $mail,
        ':phonenumber'  => $phonenumber,
        ':region'       => $region,
        ':scale'        => $scale,
        ':message'      => $message,
        ':file_path'    => $filePathJoined,
    ]);

    $insertId = $pdo->lastInsertId();

} catch (PDOException $e) {
    error_log('DB Error: ' . $e->getMessage());
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'message' => 'サーバーエラーが発生しました。']);
    exit;
}

// ========================================
// JSON で成功を返す
// ========================================
header('Content-Type: application/json; charset=utf-8');
echo json_encode([
    'success' => true,
    'message' => 'お問い合わせを受け付けました。',
    'id'      => $insertId
]);
exit;



