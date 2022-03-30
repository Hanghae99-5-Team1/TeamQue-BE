import { Report } from 'src/entity/report.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Report)
export class ReportRepository extends Repository<Report> {
  async createReport(userId: number): Promise<void> {
    const findReport = await this.findOne({ userId });

    if (!findReport) {
      this.save(this.create({ userId, reported: 1 }));
    } else {
      findReport.reported += 1;
      this.save(findReport);
    }

    return;
  }
}
