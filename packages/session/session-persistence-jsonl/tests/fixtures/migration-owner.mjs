export function createSessionMigrationPolicy(options) {
  return {
    fingerprint: 'test-migration-owner-v1',
    admit() { return false },
    mapped() {},
    rewrite(event) { return event },
    validate(artifact) {
      if (options.deny === true) throw new Error('test owner refuses publication')
      if (artifact.header.id !== options.sessionId) throw new Error('test owner Session mismatch')
    },
  }
}
