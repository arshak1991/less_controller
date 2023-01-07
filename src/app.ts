import * as express        from 'express';
import * as cors           from 'cors';
import * as morgan         from 'morgan';
import * as helmet         from 'helmet';
import * as methodOverride from 'method-override';
import * as Joi            from 'joi';

// import APIError from './services/APIError';
import routes from   './api';

import { getErrorResponse, getResponse } from './api/mainModels';
import mainConfig from './env';
import APIError from './services/APIError';

class Server {
  public app = express();

  constructor() {
    this.config();
    this.routes();
  }

  private config () {
    /** Enabling cross-origin resource sharing */
    this.app.use(cors());
    /** Logging api calls */
    this.app.use(morgan('dev'));
    /** Enabling middleware that parses json */
    this.app.use(express.json(), (err, req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (err && err.status === 400) return res.status(400).send(err.type);
    });
    /** Enabling middleware that parses urlencoded bodies */
    this.app.use(express.urlencoded({ extended: false }));
    /** Enabling method-override */
    this.app.use(methodOverride());
    /** Enabling setting various HTTP headers for security */
    this.app.use(helmet());
    /** Opening media folder */
    this.app.use('/', express.static(mainConfig.MEDIA_PATH));
  }

  public getDefaultResponse = async (req, res) => {
    res.send('ok from less');
  }
  
  private routes () {

    this.app.get('/', (req: express.Request, res: express.Response) => this.getDefaultResponse(req, res));
    this.app.use('/api', routes);

    this.app.use((err, req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (!(err instanceof APIError)) {
        new APIError(err, 500, 'Unknown error');
      }
      res.status(500).send(getErrorResponse());
    });

    this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
      res.status(404).json({
        success: false,
        message: 'API not found'
      });
    });

  }
}

export default new Server().app;