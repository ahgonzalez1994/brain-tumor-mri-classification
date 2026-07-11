# Guía paso a paso de Git y GitHub

Esta guía explica cómo usar `git` y GitHub para subir cambios de un proyecto.

El objetivo es ayudar a los estudiantes a entender que **todo cambio importante de código debe guardarse en source control** para poder revisarlo, validarlo y recuperarlo si hace falta.

## 1. ¿Qué son Git y GitHub?

- `git` es una herramienta de version control instalada en tu computadora.
- GitHub es un sitio web donde puedes guardar y compartir `git` repositories en línea.

Por qué esto importa:

- Conservas un historial de tu trabajo.
- Puedes volver a versiones anteriores.
- Los profesores o compañeros pueden revisar tus cambios.
- Tu trabajo queda respaldado en línea.

## 2. Instala las herramientas

Antes de empezar, instala:

1. `Python 3.11`
2. `Git for Windows`
3. Una cuenta de GitHub

Descargas útiles:

- Python: `https://www.python.org/downloads/`
- Git: `https://git-scm.com/download/win`
- GitHub: `https://github.com/`

## 3. Crea una cuenta de GitHub

Si el estudiante todavía no tiene una cuenta de GitHub:

1. Abre `https://github.com/`
2. Haz clic en `Sign up`
3. Crea un username, email y password
4. Verifica la cuenta de correo

Después de eso, el estudiante podrá crear repositories en línea.

## 4. Configura Git en la computadora

Abre PowerShell o Git Bash y ejecuta:

```bash
git config --global user.name "Your Name"
git config --global user.email "your_email@example.com"
```

Esto le indica a Git quién está haciendo los commits.

Para confirmar la configuración:

```bash
git config --global --list
```

## 5. Abre la carpeta del proyecto

Entra a la carpeta del proyecto desde una terminal:

```bash
cd C:\Users\suusuario\Documents\cnn-architecture
```

Si el estudiante solo quiere trabajar dentro de la carpeta `cnn_exercise`:

```bash
cd C:\Users\suusuario\Documents\cnn-architecture\cnn_exercise
```

## 6. Inicializa Git en el proyecto

Si el proyecto todavía no es un repository de `git`, ejecuta:

```bash
git init
```

Qué hace esto:

- Crea una carpeta oculta `.git`
- Inicia el control de versiones en el proyecto

Para comprobar que Git está activo:

```bash
git status
```

## 7. Crea un repository en GitHub

Ahora crea el repository en línea:

1. Inicia sesión en GitHub
2. Haz clic en `New repository`
3. Elige un nombre para el repository
4. Agrega una breve descripción si quieres
5. Elige `Public` o `Private`
6. Haz clic en `Create repository`

Después de crear el repository, GitHub mostrará comandos para conectar el proyecto local con el repository remoto.

## 8. Conecta el proyecto local con GitHub

Copia la URL del repository desde GitHub. Se verá parecida a una de estas:

```text
https://github.com/your-user/your-repository.git
```

o

```text
git@github.com:your-user/your-repository.git
```

Luego ejecuta:

```bash
git remote add origin https://github.com/your-user/your-repository.git
```

Para confirmar que el remote fue agregado:

```bash
git remote -v
```

## 9. Revisa qué archivos cambiaron

Antes de subir, revisa siempre tu trabajo:

```bash
git status
```

Este comando muestra:

- archivos nuevos
- archivos modificados
- archivos listos para commit

Este es uno de los comandos más importantes en Git.

## 10. Agrega archivos al commit

Para preparar todos los cambios actuales:

```bash
git add . 
```

Qué hace esto:

- marca los archivos que se incluirán en el siguiente commit

Para agregar solo un archivo:

```bash
git add cnn_exercise/notebooks/01_cnn_baseline.ipynb
```

## 11. Crea un commit

Un commit es un punto guardado en el historial del proyecto.

Ejemplo:

```bash
git commit -m "Add initial CNN exercise notebooks"
```

Los buenos commit messages deben:

- ser cortos
- describir el cambio con claridad
- usar verbos de acción como `Add`, `Update`, `Fix` o `Remove`

Ejemplos:

- `Add baseline CNN notebook`
- `Update transfer learning explanation`
- `Fix dataset loading issue`

## 12. Sube el commit a GitHub

La primera subida normalmente usa:

```bash
git branch -M main
git push -u origin main
```

Qué hace esto:

- renombra la branch a `main`
- sube los commits locales a GitHub
- vincula la branch local con la remote branch

Después de la primera vez, las subidas futuras normalmente son solo:

```bash
git push
```

## 13. Cómo dar acceso a otra persona al repository

Si otra persona necesita revisar, colaborar o hacer cambios, puedes darle acceso desde GitHub.

### Para un repository personal

1. Abre el repository en GitHub
2. Entra a `Settings`
3. Busca `Collaborators and teams` o `Access`, según la interfaz disponible
4. Haz clic en `Add people` o `Invite a collaborator`
5. Escribe el username o email de la persona
6. Elige el nivel de acceso apropiado
7. Envía la invitación

La otra persona tendrá que aceptar la invitación antes de poder entrar al repository.

### Para un repository de una organización

1. Abre el repository en GitHub
2. Entra a `Settings`
3. Busca `Manage access` o la sección de acceso de la organización
4. Agrega a la persona directamente o asigna un `team`
5. Define el permiso necesario
6. Confirma los cambios

En general, conviene dar el permiso mínimo necesario:

- `Read` para solo revisar
- `Write` para colaborar con cambios
- `Admin` solo para personas que administran el repository

## 14. Flujo diario para estudiantes

Este es el flujo recomendado después de hacer cambios en el código:

1. Edita el código
2. Revisa los cambios con `git status`
3. Agrega archivos con `git add .`
4. Guarda un punto de control con `git commit -m "Describe the change"`
5. Sube con `git push`

Este es el hábito principal que los estudiantes deben aprender:

**cada modificación importante debe registrarse con commit y subirse a GitHub**

Así el trabajo puede ser validado por el profesor o el equipo.

## 15. Cómo revisar lo que cambió

Para ver las diferencias exactas del código:

```bash
git diff
```

Para ver el historial de commits:

```bash
git log --oneline
```

Estos comandos ayudan a entender qué cambió y cuándo cambió.

## 16. Si GitHub pide autenticación

GitHub puede pedir que el usuario inicie sesión.

Opciones comunes:

1. Iniciar sesión desde el browser
2. Usar GitHub Desktop
3. Usar un personal access token en lugar de un password

Si el estudiante apenas comienza, GitHub Desktop puede ser más fácil que manejar la autenticación manualmente.

## 17. Errores comunes que se deben evitar

- No esperar demasiado antes de hacer commits
- No escribir commit messages poco claros como `changes` o `stuff`
- No subir trabajo roto sin explicarlo
- No olvidar `git status` antes y después de un commit
- No modificar muchas cosas no relacionadas en un solo commit si se puede evitar

## 18. Comandos mínimos que hay que recordar

Si el estudiante olvida todo lo demás, estos son los comandos más importantes:

```bash
git status
git add .
git commit -m "Describe the change"
git push
```

## 19. Regla sugerida para el aula

Una buena regla para este proyecto es:

> Cada vez que un estudiante haga una mejora importante al notebook, al modelo o a la explicación, debe guardarla con Git y subirla a GitHub.

Esto ayuda con:

- validación
- seguimiento del progreso
- colaboración
- respaldo
- responsabilidad

## 20. Ejemplo de sesión completa

```bash
cd C:\Users\su_usuario\Documents\cnn-proyectofinal
git init
git remote add origin https://github.com/your-user/your-repository.git
git status
git add .
git commit -m "Add CNN exercise materials"
git branch -M main
git push -u origin main
```

## 21. Idea final para los estudiantes

Escribir código es solo una parte del desarrollo de software.

Un flujo de trabajo profesional también incluye:

- guardar historial
- documentar cambios
- compartir progreso
- hacer que el trabajo sea revisable

Por eso subir cambios a GitHub no es opcional en un proyecto serio. Es parte del desarrollo.
