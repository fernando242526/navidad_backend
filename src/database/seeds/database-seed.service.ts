import { Injectable, Logger } from '@nestjs/common';
import { AdminSeedService } from './admin-seed.service';

@Injectable()
export class DatabaseSeedService {
  private readonly logger = new Logger(DatabaseSeedService.name);

  constructor(private readonly adminSeedService: AdminSeedService) {}

  async runSeeds(): Promise<void> {
    this.logger.log('🌱 Starting database seeding for El Pedregal...');

    try {
      // Ejecutar seeds en orden
      await this.adminSeedService.seedDefaultAdmin();

      // Aquí puedes agregar más seeds en el futuro
      // await this.vehiclesSeedService.seedDefaultVehicles();
      // await this.supplyPointsSeedService.seedDefaultSupplyPoints();

      this.logger.log('✅ Database seeding completed successfully');
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error('❌ Database seeding failed:', error.message);
      } else {
        this.logger.error(`❌ Database seeding failed: ${String(error)}`);
      }
      throw error;
    }
  }
}
