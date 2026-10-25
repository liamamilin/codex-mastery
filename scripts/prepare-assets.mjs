import { cp, mkdir } from 'node:fs/promises'
await mkdir('book/public/lab/linkshelf', { recursive: true })
await cp('cases/A-linkshelf/solution', 'book/public/lab/linkshelf/solution', { recursive: true })
await cp('assets/diagrams', 'book/public/diagrams', { recursive: true })
await cp('assets/screenshots', 'book/public/screenshots', { recursive: true })
console.log('Prepared editable diagrams and the standalone LinkShelf case.')
