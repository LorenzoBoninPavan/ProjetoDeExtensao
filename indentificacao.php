<?php
    //trim para remover espaços em branco
    //Incia as variáveis
    $tag        = trim($_POST['tag'] ?? '');
    $name       = trim($_POST['name'] ?? '');
    $date       = $_POST['date'] ?? '';
    $validacao  = trim($_POST['validacao'] ?? '');
    $observacao = trim($_POST['observacao'] ?? '');

    //Validação caso os campos estejam em branco
    if (empty($tag))        $erros[] = "TAG é obrigatória.";
    if (empty($name))       $erros[] = "Série é obrigatória.";
    if (empty($date))       $erros[] = "Data é obrigatória.";
    if (empty($validacao))  $erros[] = "Validade da inspeção é obrigatória.";

    //Verificação de imagem
    function validarImagem($file) {
        $formato = ['image/jpeg', 'image/png', 'image/jpg']; //Formatos de imagens permitidos
        return isset($file['tmp_name']) && in_array($file['type'], $formato) && $file['size'] > 0; // Verifica se a imagem não está vazia
    }

    //Definição do diretório de imagens
    $uploadDir = 'uploads/'; //Define o caminho das imagens
    if (!is_dir($uploadDir)) { // Verifica se o diretório de imagem existe
        mkdir($uploadDir, 0777, true); // Cria a pasta se não existir
    }

    //Inicializa array para armazenar os caminhos das imagens
    $fotoPaths = [];

    //Validação das imagens
    foreach (['photo', 'photo2', 'photo3'] as $polaroid) { // Verifica as 3 fotos pedidas no formulário
        if (isset($_FILES[$polaroid]) && validarImagem($_FILES[$polaroid])) { // Verifica se a imagem foi enviada e é válida
            $ext = pathinfo($_FILES[$polaroid]['name'], PATHINFO_EXTENSION); //Pega a extensão do arquivo: png, jpg ou jpeg
            $filename = uniqid() . "." . $ext; // Cria um nome único para o arquivo 
            $destino = $uploadDir . $filename; // Vincula o nome do arquivo com o nome da pasta
            move_uploaded_file($_FILES[$polaroid]['tmp_name'], $destino); // Move o arquivo para o diretório uploads
            $fotoPaths[$polaroid] = $destino; // Salva o caminho da imagem na variável $fotoPaths, com o novo nome atribuído
        } else {
            $fotoPaths[$polaroid] = null; // Caso a imagem não seja válida ou não enviada, armazena null
        }
    }
    
    // Inserção no Banco de Dados
    //$sql = "INSERT INTO inspecao (tag, serie, data, validade, observacao, foto, foto2, foto3)
        //VALUES (:tag, :serie, :data, :validade, :observacao, :foto, :foto2, :foto3)";

    //$stmt = $pdo->prepare($sql);
    //$stmt->execute([
        //':tag' => $tag,
        //':serie' => $name,
        //':data' => $date,
        //':validade' => $validacao,
        //':observacao' => $observacao,
        //':foto' => $fotoPaths['photo'],
        //':foto2' => $fotoPaths['photo2'],
        //':foto3' => $fotoPaths['photo3']
    //]);

    echo "<p>Inspeção cadastrada com sucesso!</p>";

    // Redireciona após 3 segundos
    echo "<script>
        setTimeout(function() {
            window.location.href = 'especificacao.html';
        }, 3000); // 3000 milissegundos = 3 segundos
    </script>";

?>