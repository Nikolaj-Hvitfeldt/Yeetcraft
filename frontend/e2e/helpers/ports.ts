import net from 'node:net'

export async function assertPortAvailable(host: string, port: number): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const server = net.createServer()

    server.once('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        reject(new Error(`Port ${port} on ${host} is already in use`))
        return
      }

      reject(error)
    })

    server.once('listening', () => {
      server.close((closeError) => {
        if (closeError) {
          reject(closeError)
          return
        }

        resolve()
      })
    })

    server.listen(port, host)
  })
}
