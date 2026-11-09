

export default class MiddlewareManager {
  constructor (config) {
    this.manager_book = [];

    this.actions = ['select', 'list', 'stop'];

    // Global middlewares
    const app = Object.entries(config.app);

    for (const [name, instance] of app) {
      this.manager_book.push({
        scope : 'app',
        router: '*',
        method: null,
        path  : null,

        name    : name,
        instance: instance,
      });
    }

    // Router middlewares
    const routers = Object.entries(config.routers);

    for (const [router_name, concept] of routers) {
      const internal_config = Object.entries(concept);

      for (const [method_name, routes] of internal_config) {
        const cluster = Object.entries(routes);

        for (const [path, definition] of cluster) {
          const middlewares = Object.entries(definition.middlewares ?? {});

          for (const [middleware_name, middleware_instance] of middlewares) {
            this.manager_book.push({
              scope : 'router',
              router: router_name.toUpperCase(),
              method: method_name.toUpperCase(),
              path,

              name    : middleware_name,
              instance: middleware_instance,
            });
          }
        }
      }
    }
  }

  select (filters={}) {
    const global = filters.router === '*';

    // No router filter means router middlewares only
    const entries = this.manager_book.filter(entry =>
      entry.scope === (global ? 'app' : 'router')
    );

    return entries.filter(entry =>
      Object.entries(filters).every(([key, value]) => {
        if (
          key === 'router' &&
          value === '*'
        ) return true;

        const selected = Array.isArray(value) ? value : [value];

        return selected.includes(entry[key]);
      })
    );
  }

  list () {
    return this.manager_book.map(({ instance, ...metadata }) => (
      {
        ...metadata,

        initialized: instance.initialized,
        running    : instance.running,
      }
    ));
  }

  async stop (filters={}) {
    const selected = this.select(filters);

    if (selected.length === 0) throw new Error('No matching middlewares found.');

    // Stop each unique instance once
    const instances = [...new Set(
      selected.map(entry => entry.instance)
    )];

    const results = await Promise.allSettled(
      instances.map(instance => instance.stop())
    );

    const errors = results.filter(result => result.status === 'rejected');

    return {
      selected: selected.length,
      stopped : results.length - errors.length,
      failed  : errors.map(result => result.reason),
    };
  }
}
