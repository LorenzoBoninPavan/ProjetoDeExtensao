<?php
// Conexão com o banco de dados
//$host = 'localhost';
//$dbname = 'seu_banco';
//$username = 'seu_usuario';
//$password = 'sua_senha';

//try {
    //$pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    //$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
//} catch (PDOException $e) {
    //echo 'Erro ao conectar com o banco de dados: ' . $e->getMessage();
    //exit();
//}

// Processar os dados do formulário
//if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Obter os dados do formulário
    $tipo = isset($_POST['tipo']) ? $_POST['tipo'] : null;
    $tipo_outro = isset($_POST['tipo-outro']) ? $_POST['tipo-outro'] : null;
    $fabricante = isset($_POST['fabricante']) ? $_POST['fabricante'] : null;
    $fabricante_outro = isset($_POST['fabricante-outro']) ? $_POST['fabricante-outro'] : null;
    $capacidade = isset($_POST['capacidade']) ? $_POST['capacidade'] : null;
    $capacidade_outro = isset($_POST['capacidade-outro']) ? $_POST['capacidade-outro'] : null;
    $bitola = isset($_POST['bitola']) ? $_POST['bitola'] : null;
    $bitola_outro = isset($_POST['bitola-outro']) ? $_POST['bitola-outro'] : null;
    $observacoes = isset($_POST['observacoes']) ? $_POST['observacoes'] : null;

    // Substituir os valores "outro" pelos valores especificados
    if ($tipo === 'outro') {
        $tipo = $tipo_outro;
    }
    if ($fabricante === 'outro') {
        $fabricante = $fabricante_outro;
    }
    if ($capacidade === 'outro') {
        $capacidade = $capacidade_outro;
    }
    if ($bitola === 'outro') {
        $bitola = $bitola_outro;
    }

    // Inserir no banco de dados
    //try {
        //$sql = "INSERT INTO especificacoes (tipo, fabricante, capacidade, bitola, observacoes) 
                //VALUES (:tipo, :fabricante, :capacidade, :bitola, :observacoes)";
        
        //$stmt = $pdo->prepare($sql);
        //$stmt->bindParam(':tipo', $tipo);
        //$stmt->bindParam(':fabricante', $fabricante);
        //$stmt->bindParam(':capacidade', $capacidade);
        //$stmt->bindParam(':bitola', $bitola);
        //$stmt->bindParam(':observacoes', $observacoes);
        
        //$stmt->execute();
        
        echo "Dados salvos com sucesso!";
    //} catch (PDOException $e) {
        //echo "Erro ao salvar os dados: " . $e->getMessage();
    //}
//}
?>